import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  DeleteCommand,
  GetCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { Event, EventFormData, UploadConfig } from "../types/events";
import { docClient, TableNames } from "../config/dynamodb";

class EventsService {
  private docClient: DynamoDBDocumentClient;

  constructor() {
    const client = new DynamoDBClient({});
    this.docClient = DynamoDBDocumentClient.from(client);
  }

  async listEvents(userId: string): Promise<Event[]> {
    if (!userId) throw new Error("User ID is required");

    const response = await this.docClient.send(
      new QueryCommand({
        TableName: TableNames.EVENTS,
        KeyConditionExpression: "user_id = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
    );
    return response.Items as Event[];
  }

  async createEvent(userId: string, eventData: EventFormData): Promise<Event> {
    if (!userId) throw new Error("User ID is required");

    const event: Event = {
      id: Date.now().toString(),
      userId,
      ...eventData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.docClient.send(
      new PutCommand({
        TableName: TableNames.EVENTS,
        Item: event,
      })
    );

    return event;
  }

  async updateEvent(
    userId: string,
    eventId: string,
    eventData: Partial<Event>
  ): Promise<Event> {
    if (!userId) throw new Error("User ID is required");

    // First, get the existing event to preserve createdAt
    const existingEvent = await this.docClient.send(
      new QueryCommand({
        TableName: TableNames.EVENTS,
        KeyConditionExpression: "user_id = :userId AND id = :eventId",
        ExpressionAttributeValues: {
          ":userId": userId,
          ":eventId": eventId,
        },
      })
    );

    if (!existingEvent.Items?.[0]) {
      throw new Error("Event not found");
    }

    const existingEventData = existingEvent.Items[0] as Event;

    const event: Event = {
      ...existingEventData,
      ...eventData,
      id: eventId,
      userId,
      createdAt: existingEventData.createdAt,
      updatedAt: new Date().toISOString(),
    };

    await this.docClient.send(
      new PutCommand({
        TableName: TableNames.EVENTS,
        Item: event,
      })
    );

    return event;
  }

  async deleteEvent(userId: string, eventId: string): Promise<void> {
    if (!userId) throw new Error("User ID is required");

    await this.docClient.send(
      new DeleteCommand({
        TableName: TableNames.EVENTS,
        Key: {
          user_id: userId,
          id: eventId,
        },
      })
    );
  }

  async getFanEvents(userId: string): Promise<Event[]> {
    if (!userId) throw new Error("User ID is required");

    const response = await this.docClient.send(
      new QueryCommand({
        TableName: TableNames.EVENTS,
        IndexName: "fan_events_index",
        KeyConditionExpression: "fan_id = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
    );

    return response.Items as Event[];
  }

  async getCreativeEvents(): Promise<Event[]> {
    const response = await this.docClient.send(
      new QueryCommand({
        TableName: TableNames.EVENTS,
        KeyConditionExpression: "creativeId = :creativeId",
        ExpressionAttributeValues: {
          ":creativeId": "creative",
        },
      })
    );

    return response.Items as Event[];
  }

  async validateUploadLink(eventId: string, linkId: string): Promise<boolean> {
    try {
      const event = await this.getEventById(eventId);

      // Check if event exists and has uploads enabled
      if (!event || !event.uploadConfig?.enabled) {
        return false;
      }

      // Check if upload window is active
      const now = new Date();
      const startTime = event.uploadConfig.startTime
        ? new Date(event.uploadConfig.startTime)
        : null;
      const endTime = event.uploadConfig.endTime
        ? new Date(event.uploadConfig.endTime)
        : null;

      if (startTime && now < startTime) {
        return false;
      }

      if (endTime && now > endTime) {
        return false;
      }

      // TODO: Validate linkId against stored upload links
      // For now, return true if event exists and is within upload window
      return true;
    } catch (error) {
      console.error("Error validating upload link:", error);
      return false;
    }
  }

  async getEventById(eventId: string): Promise<Event> {
    const response = await this.docClient.send(
      new GetCommand({
        TableName: TableNames.EVENTS,
        Key: {
          id: eventId,
        },
      })
    );

    if (!response.Item) {
      throw new Error("Event not found");
    }

    return response.Item as Event;
  }

  async getUploadConfig(
    eventId: string,
    linkId: string
  ): Promise<UploadConfig> {
    const event = await this.getEventById(eventId);

    if (!event.uploadConfig?.enabled) {
      throw new Error("Uploads are not enabled for this event");
    }

    return {
      enabled: true,
      maxFileSize: event.uploadConfig.maxFileSize,
      allowedTypes: event.uploadConfig.allowedTypes,
      maxFiles: event.uploadConfig.maxFiles,
      startTime: event.uploadConfig.startTime,
      endTime: event.uploadConfig.endTime,
    };
  }
}

export const eventOperations = new EventsService();
