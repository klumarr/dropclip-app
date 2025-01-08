import {
  QueryCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  docClient,
  TableNames,
  initializeAWSClient,
  createAWSClient,
} from "../config/aws-client.config";
import { NotificationItem } from "../types/notification.types";
import { getCurrentUser, fetchAuthSession } from "@aws-amplify/auth";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

class NotificationError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = "NotificationError";
  }
}

// Helper function to implement exponential backoff
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to handle retries with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  currentDelay = RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (
      retries > 0 &&
      (error.name === "TokenExpiredError" ||
        error.message.includes("Token expired") ||
        error.message.includes("Invalid token"))
    ) {
      console.log(`Retrying operation, ${retries} attempts remaining`);
      await delay(currentDelay);

      // Refresh the token
      try {
        await fetchAuthSession();
        await initializeAWSClient();
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError);
        throw new NotificationError(
          "Failed to refresh authentication",
          refreshError
        );
      }

      // Retry with exponential backoff
      return withRetry(operation, retries - 1, currentDelay * 2);
    }
    throw error;
  }
}

export const notificationService = {
  async ensureInitialized() {
    try {
      // Check if user is authenticated
      const user = await getCurrentUser();
      if (!user) {
        throw new NotificationError("User not authenticated");
      }

      // Initialize client if needed
      if (!docClient) {
        console.log("Initializing AWS client...");
        await initializeAWSClient();
      }
    } catch (error) {
      console.error("Initialization error:", error);
      throw new NotificationError(
        "Failed to initialize notification service",
        error
      );
    }
  },

  async getNotifications(userId: string): Promise<NotificationItem[]> {
    console.log("Fetching notifications for user:", userId);
    console.log("Using table:", TableNames.NOTIFICATIONS);

    return withRetry(async () => {
      await this.ensureInitialized();

      const command = new QueryCommand({
        TableName: TableNames.NOTIFICATIONS,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
        ScanIndexForward: false, // Get newest first
      });

      console.log("Query command:", JSON.stringify(command.input, null, 2));

      const response = await docClient.send(command);
      console.log("Query response:", JSON.stringify(response, null, 2));

      return response.Items as NotificationItem[];
    });
  },

  async getUnreadCount(userId: string): Promise<number> {
    return withRetry(async () => {
      await this.ensureInitialized();

      const command = new QueryCommand({
        TableName: TableNames.NOTIFICATIONS,
        IndexName: "StatusIndex",
        KeyConditionExpression: "userId = :userId AND status = :status",
        ExpressionAttributeValues: {
          ":userId": userId,
          ":status": "unread",
        },
        Select: "COUNT",
      });

      const result = await docClient.send(command);
      return result.Count || 0;
    });
  },

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    return withRetry(async () => {
      await this.ensureInitialized();

      const command = new UpdateCommand({
        TableName: TableNames.NOTIFICATIONS,
        Key: {
          userId,
          id: notificationId,
        },
        UpdateExpression: "SET #status = :status",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": "read",
        },
      });

      await docClient.send(command);
    });
  },

  async markAllAsRead(userId: string): Promise<void> {
    return withRetry(async () => {
      await this.ensureInitialized();

      // Get all unread notifications
      const unreadNotifications = await this.getNotifications(userId);

      // Update each notification
      const updatePromises = unreadNotifications
        .filter((notification) => notification.status === "unread")
        .map((notification) => this.markAsRead(userId, notification.id));

      await Promise.all(updatePromises);
    });
  },

  async createNotification(
    notification: Omit<NotificationItem, "id" | "createdAt">
  ): Promise<NotificationItem> {
    return withRetry(async () => {
      await this.ensureInitialized();

      const newNotification: NotificationItem = {
        ...notification,
        id: Date.now().toString(), // Simple ID generation
        createdAt: new Date().toISOString(),
      };

      const command = new PutCommand({
        TableName: TableNames.NOTIFICATIONS,
        Item: newNotification,
      });

      await docClient.send(command);
      return newNotification;
    });
  },

  async deleteNotification(
    userId: string,
    notificationId: string
  ): Promise<void> {
    return withRetry(async () => {
      await this.ensureInitialized();

      const command = new DeleteCommand({
        TableName: TableNames.NOTIFICATIONS,
        Key: {
          userId,
          id: notificationId,
        },
      });

      await docClient.send(command);
    });
  },

  async createGroupedNotification(
    userId: string,
    type: NotificationItem["type"],
    message: string,
    metadata?: NotificationItem["metadata"]
  ): Promise<void> {
    return withRetry(async () => {
      await this.ensureInitialized();

      // Check for existing unread notifications of the same type in the last 24 hours
      const recentNotifications = await this.getNotifications(userId);
      const similarNotification = recentNotifications.find(
        (n) =>
          n.type === type &&
          n.status === "unread" &&
          new Date().getTime() - new Date(n.createdAt).getTime() <
            24 * 60 * 60 * 1000
      );

      if (similarNotification && similarNotification.metadata?.count) {
        // Update existing notification
        const command = new UpdateCommand({
          TableName: TableNames.NOTIFICATIONS,
          Key: {
            userId,
            id: similarNotification.id,
          },
          UpdateExpression: "SET metadata.count = :count, message = :message",
          ExpressionAttributeValues: {
            ":count": similarNotification.metadata.count + 1,
            ":message": `${message} (${
              similarNotification.metadata.count + 1
            } items)`,
          },
        });

        await docClient.send(command);
      } else {
        // Create new notification
        await this.createNotification({
          userId,
          type,
          status: "unread",
          message,
          metadata: { ...metadata, count: 1 },
        });
      }
    });
  },
};
