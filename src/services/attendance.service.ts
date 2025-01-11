import {
  PutCommand,
  GetCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient, TableNames } from "../config/dynamodb";

interface AttendanceItem {
  userId: string;
  eventId: string;
  createdAt: string;
  updatedAt: string;
  status: "attending" | "not_attending";
}

class AttendanceService {
  private readonly tableName = `${process.env.VITE_STAGE || "dev"}-attendance`;

  async markAttendance(userId: string, eventId: string): Promise<void> {
    const now = new Date().toISOString();
    const item: AttendanceItem = {
      userId,
      eventId,
      createdAt: now,
      updatedAt: now,
      status: "attending",
    };

    await docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: item,
      })
    );
  }

  async unmarkAttendance(userId: string, eventId: string): Promise<void> {
    await docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { userId, eventId },
      })
    );
  }

  async checkAttendanceStatus(
    userId: string,
    eventId: string
  ): Promise<boolean> {
    const response = await docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { userId, eventId },
      })
    );
    return response.Item?.status === "attending";
  }

  async getEventAttendees(eventId: string): Promise<string[]> {
    const response = await docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: "EventAttendeesIndex",
        KeyConditionExpression: "eventId = :eventId",
        ExpressionAttributeValues: {
          ":eventId": eventId,
        },
      })
    );
    return (response.Items as AttendanceItem[]).map((item) => item.userId);
  }

  async getUserAttendedEvents(userId: string): Promise<string[]> {
    const response = await docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
    );
    return (response.Items as AttendanceItem[]).map((item) => item.eventId);
  }
}

export const attendanceService = new AttendanceService();
