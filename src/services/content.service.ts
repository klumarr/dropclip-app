import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

const dynamoDb = DynamoDBDocument.from(new DynamoDB({}));
const TABLE_NAME = "dropclip-content";

export interface Content {
  id: string;
  eventId: string;
  userId: string;
  fileUrl: string;
  thumbnailUrl?: string;
  type: string;
  status: "pending" | "approved" | "rejected";
  moderationFeedback?: string;
  uploadDate: string;
}

export const contentOperations = {
  async getEventContent(eventId: string): Promise<Content[]> {
    const params = {
      TableName: TABLE_NAME,
      IndexName: "eventId-index",
      KeyConditionExpression: "eventId = :eventId",
      ExpressionAttributeValues: {
        ":eventId": eventId,
      },
    };

    try {
      const result = await dynamoDb.query(params);
      return (result.Items || []) as Content[];
    } catch (error) {
      console.error("Error fetching event content:", error);
      throw error;
    }
  },

  async updateContentStatus(
    contentId: string,
    status: "approved" | "rejected",
    moderationFeedback?: string
  ): Promise<void> {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        id: contentId,
      },
      UpdateExpression: "SET #status = :status, moderationFeedback = :feedback",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": status,
        ":feedback": moderationFeedback || null,
      },
    };

    try {
      await dynamoDb.update(params);
    } catch (error) {
      console.error("Error updating content status:", error);
      throw error;
    }
  },

  async createContent(
    content: Omit<Content, "id" | "status" | "uploadDate">
  ): Promise<Content> {
    const newContent: Content = {
      ...content,
      id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: "pending",
      uploadDate: new Date().toISOString(),
    };

    const params = {
      TableName: TABLE_NAME,
      Item: newContent,
    };

    try {
      await dynamoDb.put(params);
      return newContent;
    } catch (error) {
      console.error("Error creating content:", error);
      throw error;
    }
  },

  async deleteContent(contentId: string): Promise<void> {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        id: contentId,
      },
    };

    try {
      await dynamoDb.delete(params);
    } catch (error) {
      console.error("Error deleting content:", error);
      throw error;
    }
  },

  async getUserContent(userId: string): Promise<Content[]> {
    const params = {
      TableName: TABLE_NAME,
      IndexName: "userId-index",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    };

    try {
      const result = await dynamoDb.query(params);
      return (result.Items || []) as Content[];
    } catch (error) {
      console.error("Error fetching user content:", error);
      throw error;
    }
  },
};
