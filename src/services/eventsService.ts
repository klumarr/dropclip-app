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
import { getCredentials } from "./auth.service";

export class EventsService {
  private docClient: DynamoDBDocumentClient | null = null;
  private retryCount = 3;
  private retryDelay = 1000; // Start with 1 second delay

  constructor() {
    console.log("EventsService - Initializing with table:", TableNames.EVENTS);
  }

  private async ensureClient(): Promise<DynamoDBDocumentClient> {
    try {
      // If client exists and is valid, return it
      if (this.docClient) {
        try {
          // Quick validation of existing client
          const client = this.docClient;
          console.log("EventsService - Validating existing DynamoDB client");
          return client;
        } catch (validationError) {
          console.log(
            "EventsService - Existing client invalid, creating new one"
          );
          this.docClient = null;
        }
      }

      console.log("EventsService - Creating new DynamoDB client");
      // Get DynamoDB client using our factory
      const dynamoDBClient = await createAWSClient(DynamoDBClient);

      // Create document client with proper marshalling options
      this.docClient = DynamoDBDocumentClient.from(dynamoDBClient, {
        marshallOptions: {
          removeUndefinedValues: true,
          convertEmptyValues: true,
        },
      });

      console.log("EventsService - DynamoDB client created successfully");
      return this.docClient;
    } catch (error: any) {
      // Log detailed error information
      console.error("EventsService - Error ensuring DynamoDB client:", {
        error: error.message,
        name: error.name,
        code: error.$metadata?.httpStatusCode,
        requestId: error.$metadata?.requestId,
      });

      // Clear the client on credential errors to force recreation
      if (
        error.message?.includes("credentials") ||
        error.message?.includes("NotAuthorizedException") ||
        error.message?.includes("TokenExpired")
      ) {
        console.log(
          "EventsService - Clearing invalid client due to credential error"
        );
        this.docClient = null;
      }

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
        console.log(
          `EventsService - Executing operation (attempt ${attempt}/${this.retryCount})`
        );
        const client = await this.ensureClient();
        return await operation(client);
      } catch (error: any) {
        lastError = error;
        console.error(`EventsService - Attempt ${attempt} failed:`, {
          error: error.message,
          name: error.name,
          code: error.$metadata?.httpStatusCode,
          requestId: error.$metadata?.requestId,
        });

        if (
          error.name === "NotAuthorizedException" ||
          error.message?.includes("credentials") ||
          error.message?.includes("TokenExpired")
        ) {
          console.log(
            "EventsService - Auth/credential error detected, invalidating client..."
          );
          this.docClient = null; // Force client recreation on next attempt

          if (attempt < this.retryCount) {
            console.log(`EventsService - Waiting ${delay}ms before retry...`);
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
    console.log("EventsService - Listing events for creative:", creativeId);

    return this.executeWithRetry(async (client) => {
      const command = new QueryCommand({
        TableName: TableNames.EVENTS,
        IndexName: "CreativeIdIndex",
        KeyConditionExpression: "creativeId = :creativeId",
        ExpressionAttributeValues: {
          ":creativeId": creativeId,
        },
      });

      console.log(
        "EventsService - Executing query command:",
        JSON.stringify(command.input, null, 2)
      );
      const response = await client.send(command);
      console.log(
        "EventsService - Events retrieved successfully:",
        response.Items?.length
      );
      return response.Items as Event[];
    });
  }

  async createEvent(
    creativeId: string,
    eventData: EventFormData
  ): Promise<Event> {
    console.log("EventsService - Creating event for creative:", creativeId);

    return this.executeWithRetry(async (client) => {
      // Get AWS identity ID
      const credentials = await getCredentials();
      const identityId = credentials.identityId;
      console.log(
        "EventsService - Got identity ID for event creation:",
        identityId
      );

      const eventId = uuidv4();
      const now = new Date().toISOString();
      const dateId = eventData.details.date.replace(/-/g, "");
      const dateCreativeId = `${dateId}#${creativeId}`;

      const event: Event = {
        id: eventId,
        creativeId,
        identityId,
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

      console.log(
        "EventsService - Executing put command:",
        JSON.stringify(command.input, null, 2)
      );
      await client.send(command);
      console.log("EventsService - Event created successfully:", eventId);
      return event;
    });
  }

  async getEventById(
    eventId: string,
    creativeId?: string
  ): Promise<Event | null> {
    console.log(
      "EventsService - Getting event by ID:",
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

        console.log(
          "EventsService - Executing get command:",
          JSON.stringify(command.input, null, 2)
        );
        const response = await client.send(command);
        if (!response.Item) {
          console.log("EventsService - Event not found");
          return null;
        }

        console.log("EventsService - Event retrieved successfully");
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

      console.log(
        "EventsService - Executing query command:",
        JSON.stringify(command.input, null, 2)
      );
      const response = await client.send(command);
      if (!response.Items?.[0]) {
        console.log("EventsService - Event not found");
        return null;
      }

      console.log("EventsService - Event retrieved successfully");
      return response.Items[0] as Event;
    });
  }

  async deleteEvent(eventId: string, creativeId: string): Promise<void> {
    console.log(
      "EventsService - Deleting event:",
      eventId,
      "for creative:",
      creativeId
    );

    return this.executeWithRetry(async (client) => {
      const command = new DeleteCommand({
        TableName: TableNames.EVENTS,
        Key: {
          id: eventId,
          creativeId,
        },
      });

      console.log(
        "EventsService - Executing delete command:",
        JSON.stringify(command.input, null, 2)
      );
      await client.send(command);
      console.log("EventsService - Event deleted successfully");
    });
  }

  async updateEvent(
    eventId: string,
    creativeId: string,
    eventData: Partial<Event>
  ): Promise<Event> {
    console.log("🔍 EventsService - Update Request:", {
      eventId,
      creativeId,
      eventDataKeys: Object.keys(eventData),
      identityMatch: `Checking if creativeId ${creativeId} matches the AWS identity ID`,
    });

    return this.executeWithRetry(async (client) => {
      // Get AWS identity ID
      const credentials = await getCredentials();
      const identityId = credentials.identityId;
      console.log(
        "EventsService - Got identity ID for event update:",
        identityId
      );

      // Get the existing event first
      const existingEvent = await this.getEventById(eventId, creativeId);
      console.log("📝 EventsService - Existing Event:", {
        found: !!existingEvent,
        eventId,
        existingCreativeId: existingEvent?.creativeId,
        requestedCreativeId: creativeId,
        matched: existingEvent?.creativeId === creativeId,
      });

      if (!existingEvent) {
        throw new Error(`Event not found: ${eventId}`);
      }

      // Prepare the updated event data
      const updatedEvent = {
        ...existingEvent,
        ...eventData,
        identityId, // Update with current identity ID
        updatedAt: new Date().toISOString(),
      };

      console.log("📦 EventsService - Preparing Update:", {
        eventId: updatedEvent.id,
        creativeId: updatedEvent.creativeId,
        identityId: updatedEvent.identityId,
        originalCreativeId: existingEvent.creativeId,
        requestedCreativeId: creativeId,
        matched: updatedEvent.creativeId === creativeId,
      });

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

      console.log("🚀 EventsService - Executing Update Command:", {
        tableName: TableNames.EVENTS,
        itemId: updatedEvent.id,
        itemCreativeId: updatedEvent.creativeId,
        itemIdentityId: updatedEvent.identityId,
        conditionCreativeId: creativeId,
        command: JSON.stringify(command.input, null, 2),
      });

      await client.send(command);
      console.log("✅ EventsService - Update Successful:", {
        eventId,
        creativeId,
        identityId,
        matched: updatedEvent.creativeId === creativeId,
      });

      return updatedEvent;
    });
  }
}
