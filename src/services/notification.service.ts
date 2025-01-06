import { DynamoDB } from "aws-sdk";
import { useAuth } from "../contexts/AuthContext";

export interface Notification {
  id: string;
  userId: string;
  type: "upload" | "moderation" | "system" | "download";
  status: "read" | "unread";
  title: string;
  message: string;
  timestamp: Date;
  actionUrl?: string;
  metadata?: {
    eventId?: string;
    uploadId?: string;
    count?: number;
  };
}

export type NotificationType = "upload" | "moderation" | "system" | "download";

class NotificationService {
  private dynamoDB: DynamoDB.DocumentClient;
  private readonly TABLE_NAME = "dev-notifications";

  constructor() {
    this.dynamoDB = new DynamoDB.DocumentClient();
  }

  async getNotifications(
    userId: string,
    limit: number = 10
  ): Promise<Notification[]> {
    const params = {
      TableName: this.TABLE_NAME,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
      Limit: limit,
      ScanIndexForward: false, // Get newest first
    };

    try {
      const result = await this.dynamoDB.query(params).promise();
      return (result.Items as Notification[]) || [];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    const params = {
      TableName: this.TABLE_NAME,
      KeyConditionExpression: "userId = :userId AND status = :status",
      ExpressionAttributeValues: {
        ":userId": userId,
        ":status": "unread",
      },
      Select: "COUNT",
    };

    try {
      const result = await this.dynamoDB.query(params).promise();
      return result.Count || 0;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      throw error;
    }
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const params = {
      TableName: this.TABLE_NAME,
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
    };

    try {
      await this.dynamoDB.update(params).promise();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    // Get all unread notifications
    const unreadNotifications = await this.getNotifications(userId);

    // Update each notification
    const updatePromises = unreadNotifications
      .filter((notification) => notification.status === "unread")
      .map((notification) => this.markAsRead(userId, notification.id));

    await Promise.all(updatePromises);
  }

  async createNotification(
    notification: Omit<Notification, "id" | "timestamp">
  ): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(), // Simple ID generation
      timestamp: new Date(),
    };

    const params = {
      TableName: this.TABLE_NAME,
      Item: newNotification,
    };

    try {
      await this.dynamoDB.put(params).promise();
      return newNotification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  async deleteNotification(
    userId: string,
    notificationId: string
  ): Promise<void> {
    const params = {
      TableName: this.TABLE_NAME,
      Key: {
        userId,
        id: notificationId,
      },
    };

    try {
      await this.dynamoDB.delete(params).promise();
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  // Helper method to create grouped notifications
  async createGroupedNotification(
    userId: string,
    type: Notification["type"],
    title: string,
    message: string,
    metadata?: Notification["metadata"]
  ): Promise<void> {
    // Check for existing unread notifications of the same type in the last 24 hours
    const recentNotifications = await this.getNotifications(userId);
    const similarNotification = recentNotifications.find(
      (n) =>
        n.type === type &&
        n.status === "unread" &&
        new Date().getTime() - new Date(n.timestamp).getTime() <
          24 * 60 * 60 * 1000
    );

    if (similarNotification && similarNotification.metadata?.count) {
      // Update existing notification
      const params = {
        TableName: this.TABLE_NAME,
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
      };

      await this.dynamoDB.update(params).promise();
    } else {
      // Create new notification
      await this.createNotification({
        userId,
        type,
        status: "unread",
        title,
        message,
        metadata: { ...metadata, count: 1 },
      });
    }
  }
}

export const notificationService = new NotificationService();
