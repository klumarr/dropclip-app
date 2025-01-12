import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Event, EventFormData } from "../types/events";
import { v4 as uuidv4 } from "uuid";
import { TableNames } from "../config/dynamodb";
import { createAWSClient } from "./aws-client.factory";

export class EventsService {
  private docClient: DynamoDBDocumentClient | null = null;
  private retryCount = 3;
  private retryDelay = 1000; // Start with 1 second delay

  constructor() {
    console.log("Initializing EventsService with table:", TableNames.EVENTS);
  }

  private async ensureClient(): Promise<DynamoDBDocumentClient> {
    try {
      // If client exists, return it
      if (this.docClient) {
        return this.docClient;
      }

      // Get DynamoDB client using our factory
      const dynamoDBClient = await createAWSClient(DynamoDBClient);

      // Create document client
      this.docClient = DynamoDBDocumentClient.from(dynamoDBClient, {
        marshallOptions: {
          removeUndefinedValues: true,
          convertEmptyValues: true,
        },
      });

      return this.docClient;
    } catch (error) {
      console.error("Error ensuring DynamoDB client:", error);
      throw error;
    }
  }

  private async executeWithRetry<T>(
    operation: (client: DynamoDBDocumentClient) => Promise<T>
  ): Promise<T> {
    let lastError: any;
    let delay = this.retryDelay;

    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        const client = await this.ensureClient();
        return await operation(client);
      } catch (error: any) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error);

        if (error.name === "NotAuthorizedException") {
          console.log("Auth error detected, invalidating client...");
          this.docClient = null; // Force client recreation on next attempt

          if (attempt < this.retryCount) {
            console.log(`Waiting ${delay}ms before retry...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
          }
        } else {
          // For non-auth errors, throw immediately
          throw error;
        }
      }
    }

    throw lastError;
  }

  async listEvents(creativeId: string): Promise<Event[]> {
    console.log("Listing events for creative:", creativeId);

    return this.executeWithRetry(async (client) => {
      const command = new QueryCommand({
        TableName: TableNames.EVENTS,
        IndexName: "CreativeIdIndex",
        KeyConditionExpression: "creativeId = :creativeId",
        ExpressionAttributeValues: {
          ":creativeId": creativeId,
        },
      });

      const response = await client.send(command);
      console.log("Events retrieved successfully:", response.Items?.length);
      return response.Items as Event[];
    });
  }

  async createEvent(
    creativeId: string,
    eventData: EventFormData
  ): Promise<Event> {
    console.log("Creating event for creative:", creativeId);

    return this.executeWithRetry(async (client) => {
      const eventId = uuidv4();
      const now = new Date().toISOString();
      const dateId = eventData.details.date.replace(/-/g, "");
      const dateCreativeId = `${dateId}#${creativeId}`;

      const event: Event = {
        id: eventId,
        creativeId,
        dateId,
        dateCreativeId,
        ...eventData.details,
        endDate: eventData.details.endDate || eventData.details.date,
        endTime: eventData.details.endTime || eventData.details.time,
        createdAt: now,
        updatedAt: now,
      };

      const command = new PutCommand({
        TableName: TableNames.EVENTS,
        Item: event,
      });

      await client.send(command);
      console.log("Event created successfully:", eventId);
      return event;
    });
  }

  async getEventById(
    eventId: string,
    creativeId?: string
  ): Promise<Event | null> {
    console.log(
      "Getting event by ID:",
      eventId,
      creativeId ? `for creative: ${creativeId}` : ""
    );

    return this.executeWithRetry(async (client) => {
      if (creativeId) {
        const command = new GetCommand({
          TableName: TableNames.EVENTS,
          Key: {
            id: eventId,
            creativeId,
          },
        });

        const response = await client.send(command);
        if (!response.Item) {
          console.log("Event not found");
          return null;
        }

        console.log("Event retrieved successfully");
        return response.Item as Event;
      }

      // Fallback to scan if no creativeId provided (less efficient)
      const command = new QueryCommand({
        TableName: TableNames.EVENTS,
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
          ":id": eventId,
        },
      });

      const response = await client.send(command);
      if (!response.Items?.[0]) {
        console.log("Event not found");
        return null;
      }

      console.log("Event retrieved successfully");
      return response.Items[0] as Event;
    });
  }

  async deleteEvent(eventId: string, creativeId: string): Promise<void> {
    console.log("Deleting event:", eventId, "for creative:", creativeId);

    return this.executeWithRetry(async (client) => {
      const command = new DeleteCommand({
        TableName: TableNames.EVENTS,
        Key: {
          id: eventId,
          creativeId,
        },
      });

      await client.send(command);
      console.log("Event deleted successfully");
    });
  }

  async updateEvent(
    eventId: string,
    creativeId: string,
    eventData: Partial<Event>
  ): Promise<Event> {
    console.log("Updating event:", { eventId, creativeId, eventData });

    return this.executeWithRetry(async (client) => {
      // Get the existing event first
      const existingEvent = await this.getEventById(eventId, creativeId);
      if (!existingEvent) {
        throw new Error(`Event not found: ${eventId}`);
      }

      // Prepare the updated event data
      const updatedEvent = {
        ...existingEvent,
        ...eventData,
        updatedAt: new Date().toISOString(),
      };

      // Update the event in DynamoDB
      const command = new PutCommand({
        TableName: TableNames.EVENTS,
        Item: updatedEvent,
        ConditionExpression:
          "attribute_exists(id) AND creativeId = :creativeId",
        ExpressionAttributeValues: {
          ":creativeId": creativeId,
        },
      });

      console.log("Executing update command:", command.input);
      await client.send(command);
      console.log("Event updated successfully");

      return updatedEvent;
    });
  }
}
