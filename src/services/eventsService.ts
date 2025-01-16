import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  GetCommand,
  DeleteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { Event, EventFormData, UploadConfig } from "../types/events";
import { v4 as uuidv4 } from "uuid";
import { TableNames } from "../config/dynamodb";
import { createAWSClient } from "./aws-client.factory";
import { getCredentials } from "./auth.service";
import { s3Operations } from "./s3.service";
import { cloudfrontOperations } from "./cloudfront.service";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

export const eventOperations = {
  getFanEvents: async (userId: string): Promise<Event[]> => {
    const service = new EventsService();
    return service.getFanEvents(userId);
  },

  getEventById: async (
    eventId: string,
    creativeId?: string
  ): Promise<Event | null> => {
    const service = new EventsService();
    return service.getEventById(eventId, creativeId);
  },

  getEventByLinkId: async (linkId: string): Promise<Event | null> => {
    const service = new EventsService();
    return service.getEventByLinkId(linkId);
  },

  createEvent: async (
    userId: string,
    eventData: EventFormData,
    flyerFile?: File
  ): Promise<Event> => {
    const service = new EventsService();
    return service.createEvent(userId, eventData, flyerFile);
  },

  updateEvent: async (
    eventId: string,
    userId: string,
    eventData: Partial<Event>
  ): Promise<Event> => {
    const service = new EventsService();
    return service.updateEvent(eventId, userId, eventData);
  },

  deleteEvent: async (eventId: string, userId: string): Promise<void> => {
    const service = new EventsService();
    return service.deleteEvent(eventId, userId);
  },

  listEvents: async (userId: string): Promise<Event[]> => {
    const service = new EventsService();
    return service.listEvents(userId);
  },

  validateUploadLink: async (
    eventId: string,
    linkId: string
  ): Promise<boolean> => {
    const service = new EventsService();
    return service.validateUploadLink(eventId, linkId);
  },

  getUploadConfig: async (
    eventId: string,
    linkId: string
  ): Promise<UploadConfig> => {
    const service = new EventsService();
    return service.getUploadConfig(eventId, linkId);
  },

  getPublicEvent: async (eventId: string): Promise<Event | null> => {
    const service = new EventsService();
    return service.getPublicEventById(eventId);
  },

  shareEvent: async (eventId: string): Promise<void> => {
    const service = new EventsService();
    await service.shareEvent(eventId);
  },
};

export class EventsService {
  private docClient: DynamoDBDocumentClient | null = null;
  private unauthClient: DynamoDBDocumentClient | null = null;
  private retryCount = 3;
  private retryDelay = 1000;

  constructor() {
    console.log("EventsService - Initializing with table:", TableNames.EVENTS);
  }

  private async getUnauthenticatedClient(): Promise<DynamoDBDocumentClient> {
    if (this.unauthClient) return this.unauthClient;

    try {
      console.log("EventsService - Creating unauthenticated DynamoDB client");
      const region = import.meta.env.VITE_AWS_REGION;
      const identityPoolId = import.meta.env.VITE_IDENTITY_POOL_ID;

      if (!region || !identityPoolId) {
        throw new Error("Missing required AWS configuration");
      }

      const credentials = fromCognitoIdentityPool({
        clientConfig: { region },
        identityPoolId,
      });

      const client = new DynamoDBClient({
        region,
        credentials,
      });

      this.unauthClient = DynamoDBDocumentClient.from(client, {
        marshallOptions: {
          removeUndefinedValues: true,
          convertEmptyValues: true,
        },
      });

      console.log(
        "EventsService - Successfully created unauthenticated client"
      );
      return this.unauthClient;
    } catch (error) {
      console.error(
        "EventsService - Failed to create unauthenticated client:",
        error
      );
      throw new Error("Failed to initialize database connection");
    }
  }

  async getPublicEventById(eventId: string): Promise<Event | null> {
    console.log(`EventsService - Fetching public event with ID: ${eventId}`);
    try {
      const region = import.meta.env.VITE_AWS_REGION;
      const identityPoolId = import.meta.env.VITE_IDENTITY_POOL_ID;

      if (!region || !identityPoolId) {
        throw new Error("Missing required AWS configuration");
      }

      const credentials = fromCognitoIdentityPool({
        clientConfig: { region },
        identityPoolId,
      });

      const client = DynamoDBDocumentClient.from(
        new DynamoDBClient({
          region,
          credentials,
        })
      );

      const command = new QueryCommand({
        TableName: TableNames.EVENTS,
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
          ":id": eventId,
        },
        Limit: 1,
      });

      const response = await client.send(command);
      if (!response.Items || response.Items.length === 0) {
        console.log(`EventsService - No event found with ID: ${eventId}`);
        return null;
      }

      console.log(
        `EventsService - Successfully fetched public event:`,
        response.Items[0]
      );
      return response.Items[0] as Event;
    } catch (error) {
      console.error(`EventsService - Error fetching public event:`, error);
      throw new Error("Failed to fetch event details");
    }
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
    userId: string,
    eventData: EventFormData,
    flyerFile?: File
  ): Promise<Event> {
    console.log("EventsService - Creating event for creative:", userId);

    return this.executeWithRetry(async (client) => {
      const credentials = await getCredentials();
      const identityId = credentials.identityId;
      console.log(
        "EventsService - Got identity ID for event creation:",
        identityId
      );

      const eventId = uuidv4();
      const now = new Date().toISOString();
      let imageUrl: string | undefined;
      let fileKey: string | undefined;

      // Handle flyer upload if provided
      if (flyerFile) {
        try {
          // Generate the key for the upload bucket
          fileKey = await s3Operations.generateFlyerKey(
            eventId,
            flyerFile.name
          );

          // Get pre-signed URL for upload
          const uploadUrl = await s3Operations.getUploadUrl(
            fileKey,
            flyerFile.type
          );

          // Upload the file
          await fetch(uploadUrl, {
            method: "PUT",
            body: flyerFile,
            headers: {
              "Content-Type": flyerFile.type,
            },
          });

          // Copy the file to the content bucket with the same key
          await s3Operations.copyFile(fileKey, fileKey);

          // Delete the file from the uploads bucket
          await s3Operations.deleteFile(fileKey);

          // Get the CloudFront URL for the file in the content bucket
          imageUrl = cloudfrontOperations.getFileUrl(fileKey);
        } catch (error) {
          console.error("Failed to handle flyer file:", error);
          throw new Error("Failed to upload flyer file");
        }
      }

      const dateId = eventData.date.replace(/-/g, "");
      const dateCreativeId = `${dateId}#${userId}`;

      const event: Event = {
        id: eventId,
        creativeId: userId,
        identityId,
        dateId,
        dateCreativeId,
        ...eventData,
        flyerUrl: imageUrl,
        endDate: eventData.endDate || eventData.date,
        endTime: eventData.endTime || eventData.time,
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
      // Get the event first to check if it has an image
      const event = await this.getEventById(eventId, creativeId);

      // Delete the event from DynamoDB
      const command = new DeleteCommand({
        TableName: TableNames.EVENTS,
        Key: { id: eventId, creativeId },
      });

      console.log(
        "EventsService - Executing delete command:",
        JSON.stringify(command.input, null, 2)
      );
      await client.send(command);

      // If event had an image, invalidate its cache
      if (event?.flyerUrl) {
        await cloudfrontOperations.invalidateEventCache(eventId);
      }

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
    });

    return this.executeWithRetry(async (client) => {
      const credentials = await getCredentials();
      const identityId = credentials.identityId;

      // Get the existing event first
      const existingEvent = await this.getEventById(eventId, creativeId);
      if (!existingEvent) {
        throw new Error(`Event not found: ${eventId}`);
      }

      // Prepare the updated event data
      const updatedEvent = {
        ...existingEvent,
        ...eventData,
        identityId,
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

      await client.send(command);
      console.log("✅ EventsService - Update Successful:", {
        eventId,
        creativeId,
        identityId,
      });

      return updatedEvent;
    });
  }

  async getFanEvents(userId: string): Promise<Event[]> {
    console.log("EventsService - Getting events for fan:", userId);

    return this.executeWithRetry(async (client) => {
      const command = new QueryCommand({
        TableName: TableNames.EVENTS,
        IndexName: "DateIdIndex",
        KeyConditionExpression: "dateId >= :dateId",
        ExpressionAttributeValues: {
          ":dateId": new Date().toISOString().split("T")[0].replace(/-/g, ""),
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

  async getEventByLinkId(linkId: string): Promise<Event | null> {
    console.log("EventsService - Getting event by link ID:", linkId);

    return this.executeWithRetry(async (client) => {
      const command = new QueryCommand({
        TableName: TableNames.EVENTS,
        IndexName: "LinkIdIndex",
        KeyConditionExpression: "linkId = :linkId",
        ExpressionAttributeValues: {
          ":linkId": linkId,
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

  async validateUploadLink(eventId: string, linkId: string): Promise<boolean> {
    console.log("EventsService - Validating upload link:", { eventId, linkId });

    return this.executeWithRetry(async (client) => {
      const event = await this.getEventById(eventId);
      if (!event) {
        console.log("EventsService - Event not found");
        return false;
      }

      // TODO: Implement actual link validation logic
      return true;
    });
  }

  async getUploadConfig(
    eventId: string,
    linkId: string
  ): Promise<UploadConfig> {
    console.log("EventsService - Getting upload config:", { eventId, linkId });

    return this.executeWithRetry(async (client) => {
      const event = await this.getEventById(eventId);
      if (!event) {
        throw new Error("Event not found");
      }

      // Get the event's upload config
      const command = new GetCommand({
        TableName: TableNames.EVENTS,
        Key: {
          id: eventId,
        },
      });

      const response = await client.send(command);
      if (!response.Item?.uploadConfig) {
        throw new Error("Upload config not found");
      }

      return response.Item.uploadConfig as UploadConfig;
    });
  }

  async shareEvent(eventId: string): Promise<void> {
    try {
      console.log("EventsService - Sharing event:", eventId);
      const event = await this.getEventById(eventId);

      if (!event) {
        throw new Error("Event not found");
      }

      // TODO: Implement actual sharing logic
      // This could involve:
      // 1. Generating a shareable link
      // 2. Creating a public access token
      // 3. Updating event sharing settings
      // 4. Returning sharing details

      console.log("EventsService - Event shared successfully");
    } catch (error) {
      console.error("EventsService - Error sharing event:", error);
      throw error;
    }
  }
}
