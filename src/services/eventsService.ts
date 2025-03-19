import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  GetCommand,
  DeleteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { Event, EventFormData, UploadConfig } from "../types/events.types";
import { EventItem } from "../types/dynamodb";
import { v4 as uuidv4 } from "uuid";
import { TableNames } from "../config/dynamodb";
import { createAWSClient } from "./aws-client.factory";
import { getCredentials } from "./auth.service";
import { s3Operations } from "./s3.service";
import { cloudfrontOperations } from "./cloudfront.service";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { userService } from "./user.service";
import { EventType } from "../types/events.types";
import { nanoid } from "nanoid";

// Export the class so it can be used directly if needed
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

  private async getAuthenticatedClient(): Promise<DynamoDBDocumentClient> {
    try {
      console.log("📜 EventsService - Getting authenticated DynamoDB client");

      if (!this.docClient) {
        console.log("🔄 EventsService - Creating new DynamoDB client instance");
        const client = await createAWSClient(DynamoDBClient);

        this.docClient = DynamoDBDocumentClient.from(client, {
          marshallOptions: {
            removeUndefinedValues: true,
            convertEmptyValues: true,
          },
        });

        console.log("✅ EventsService - DynamoDB client created successfully");
      } else {
        console.log("✅ EventsService - Using existing DynamoDB client");
      }

      return this.docClient;
    } catch (error) {
      console.error(
        "❌ EventsService - Error getting authenticated DynamoDB client:",
        error
      );
      console.error(
        "❌ EventsService - Stack trace:",
        error instanceof Error ? error.stack : "No stack trace"
      );

      // Reset the client so next time we try to create a new one
      this.docClient = null;

      // Throw a friendly error
      if (error instanceof Error) {
        if (error.message.includes("credentials")) {
          throw new Error(
            "Authentication error: Unable to get valid AWS credentials. Please make sure you're logged in."
          );
        } else if (
          error.message.includes("Missing required AWS configuration")
        ) {
          throw new Error(
            "Configuration error: Missing required AWS settings. Please check your environment variables."
          );
        }
      }

      // Re-throw the original error if we didn't handle it specially
      throw error;
    }
  }

  async getPublicEventById(eventId: string): Promise<Event | null> {
    console.log("🔍 EventsService - Fetching public event by ID:", eventId);
    try {
      const client = await this.getUnauthenticatedClient();
      const eventCommand = new QueryCommand({
        TableName: TableNames.EVENTS,
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
          ":id": eventId,
        },
        Limit: 1,
      });

      const eventResponse = await client.send(eventCommand);
      if (!eventResponse.Items?.[0]) {
        console.log("❌ EventsService - No event found with ID:", eventId);
        return null;
      }

      const event = eventResponse.Items[0] as EventItem;
      console.log("📦 EventsService - Event data:", event);

      // Get creative's profile data using the imported instance
      const creativeProfile = await userService.getPublicProfile(
        event.creativeId
      );
      console.log("👤 EventsService - Creative profile:", creativeProfile);

      // Generate dateId and dateCreativeId
      const dateId = event.date.split("T")[0];
      const dateCreativeId = `${dateId}#${event.creativeId}`;

      // Merge event data with creative profile data
      const enrichedEvent: Event = {
        ...event,
        dateId,
        dateCreativeId,
        type: event.type as EventType,
        creativeName: creativeProfile?.displayName || event.creativeName,
        creativeType: creativeProfile?.creativeType || event.creativeType,
        creativePhotoUrl: creativeProfile?.avatarUrl || event.creativePhotoUrl,
        creativeBio: creativeProfile?.bio || event.creativeBio,
        creativeStats: event.creativeStats || {
          upcomingEvents: 0,
          totalEvents: 0,
          followers: 0,
        },
      };

      console.log("✅ EventsService - Enriched event data:", enrichedEvent);
      return enrichedEvent;
    } catch (error) {
      console.error("❌ EventsService - Error fetching public event:", error);
      throw error;
    }
  }

  async getUpcomingEventsByCreativeId(creativeId: string): Promise<Event[]> {
    console.log(
      `EventsService - Fetching upcoming events for creative: ${creativeId}`
    );
    try {
      const client = await this.getUnauthenticatedClient();
      const now = new Date().toISOString().split("T")[0];

      const command = new QueryCommand({
        TableName: TableNames.EVENTS,
        IndexName: "CreativeIdIndex",
        KeyConditionExpression: "creativeId = :creativeId",
        FilterExpression: "#eventDate >= :now",
        ExpressionAttributeNames: {
          "#eventDate": "date",
        },
        ExpressionAttributeValues: {
          ":creativeId": creativeId,
          ":now": now,
        },
      });

      const response = await client.send(command);
      const events = (response.Items as Event[]) || [];

      // Sort by date and time
      events.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });

      console.log(`EventsService - Found ${events.length} upcoming events`);
      return events;
    } catch (error) {
      console.error(`EventsService - Error fetching upcoming events:`, error);
      throw new Error("Failed to fetch upcoming events");
    }
  }

  async saveEvent(eventId: string): Promise<void> {
    // TODO: Implement save event functionality
    console.log(`EventsService - Saving event: ${eventId}`);
  }

  async unsaveEvent(eventId: string): Promise<void> {
    // TODO: Implement unsave event functionality
    console.log(`EventsService - Unsaving event: ${eventId}`);
  }

  async getSavedEvents(): Promise<Event[]> {
    // TODO: Implement get saved events functionality
    console.log("EventsService - Getting saved events");
    return [];
  }

  async getFanEvents(userId: string): Promise<Event[]> {
    console.log(`EventsService - Fetching events for fan: ${userId}`);
    try {
      const client = await this.getUnauthenticatedClient();
      const command = new QueryCommand({
        TableName: TableNames.EVENTS,
        IndexName: "FanEventsIndex",
        KeyConditionExpression: "fanId = :fanId",
        ExpressionAttributeValues: {
          ":fanId": userId,
        },
      });

      const response = await client.send(command);
      return (response.Items as Event[]) || [];
    } catch (error) {
      console.error("Error fetching fan events:", error);
      throw new Error("Failed to fetch fan events");
    }
  }

  async getEventByLinkId(linkId: string): Promise<Event | null> {
    console.log(`EventsService - Fetching event by link ID: ${linkId}`);
    try {
      const client = await this.getUnauthenticatedClient();
      const command = new QueryCommand({
        TableName: TableNames.EVENTS,
        IndexName: "LinkIdIndex",
        KeyConditionExpression: "linkId = :linkId",
        ExpressionAttributeValues: {
          ":linkId": linkId,
        },
        Limit: 1,
      });

      const response = await client.send(command);
      return (response.Items?.[0] as Event) || null;
    } catch (error) {
      console.error("Error fetching event by link ID:", error);
      throw new Error("Failed to fetch event");
    }
  }

  async createEvent(
    userId: string,
    eventData: EventFormData,
    flyerFile?: File
  ): Promise<Event> {
    console.log(`🚀 EventsService - Creating event START - user: ${userId}`, {
      eventData,
      hasImage: !!flyerFile,
      environment: import.meta.env.MODE,
      region: import.meta.env.VITE_AWS_REGION,
    });

    try {
      // Generate a unique ID for the event
      const eventId = nanoid();
      console.log(`📝 EventsService - Generated event ID: ${eventId}`);

      // Format the event data
      const now = new Date().toISOString();
      const dateId = eventData.date.split("T")[0];
      const dateCreativeId = `${dateId}#${userId}`;

      console.log(`🔍 EventsService - Getting authenticated client...`);
      // Get authenticated client - with additional error handling
      let client;
      try {
        client = await this.getAuthenticatedClient();
        console.log(`✅ EventsService - Got authenticated client successfully`);
      } catch (authError) {
        console.error(`❌ EventsService - Auth client error:`, authError);
        throw new Error(
          `Authentication error: ${
            authError instanceof Error ? authError.message : String(authError)
          }`
        );
      }

      // Create the event item to save to DynamoDB
      const eventItem: any = {
        id: eventId,
        creativeId: userId,
        name: eventData.name,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        venue: eventData.venue,
        city: eventData.city,
        country: eventData.country,
        type: eventData.type,
        tags: eventData.tags || [],
        flyerUrl: eventData.flyerUrl || "",
        dateId,
        dateCreativeId,
        ticketLink: eventData.ticketLink || "",
        uploadConfig: eventData.uploadConfig || { enabled: false },
        createdAt: now,
        updatedAt: now,
      };

      // Add the end date and time if provided
      if (eventData.endDate) {
        eventItem.endDate = eventData.endDate;
      }

      if (eventData.endTime) {
        eventItem.endTime = eventData.endTime;
      }

      console.log(`📦 EventsService - Prepared event item:`, eventItem);
      console.log(
        `💾 EventsService - Creating event in DynamoDB table: ${TableNames.EVENTS}`
      );

      // Create event in DynamoDB
      const command = new PutCommand({
        TableName: TableNames.EVENTS,
        Item: eventItem,
      });

      console.log(`📡 EventsService - Sending command to DynamoDB...`);
      await client.send(command);
      console.log(`✅ EventsService - Event created with ID: ${eventId}`);

      // Return the created event
      const result = {
        ...eventItem,
        // Fill in any missing fields needed by the Event type
        creativeName: "",
        creativeType: "",
        creativePhotoUrl: "",
        creativeBio: "",
        creativeStats: {
          upcomingEvents: 0,
          totalEvents: 0,
          followers: 0,
        },
      } as Event;

      console.log(`🎉 EventsService - Returning created event:`, result);
      return result;
    } catch (error) {
      console.error("❌ EventsService - Error creating event:", error);
      console.error(
        "❌ EventsService - Error stack:",
        error instanceof Error ? error.stack : "No stack trace"
      );
      throw new Error(
        `Failed to create event: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  async updateEvent(
    eventId: string,
    userId: string,
    eventData: Partial<Event>
  ): Promise<Event> {
    console.log(`EventsService - Updating event: ${eventId}`);
    try {
      const client = await this.getUnauthenticatedClient();
      const command = new UpdateCommand({
        TableName: TableNames.EVENTS,
        Key: {
          id: eventId,
          creativeId: userId,
        },
        UpdateExpression: "set updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":updatedAt": new Date().toISOString(),
          ...eventData,
        },
        ReturnValues: "ALL_NEW",
      });

      const response = await client.send(command);
      return response.Attributes as Event;
    } catch (error) {
      console.error("Error updating event:", error);
      throw new Error("Failed to update event");
    }
  }

  async validateUploadLink(eventId: string, linkId: string): Promise<boolean> {
    console.log(`EventsService - Validating upload link for event: ${eventId}`);
    try {
      const event = await this.getEventByLinkId(linkId);
      return event?.id === eventId;
    } catch (error) {
      console.error("Error validating upload link:", error);
      return false;
    }
  }

  async getUploadConfig(
    eventId: string,
    linkId: string
  ): Promise<UploadConfig> {
    console.log(`EventsService - Getting upload config for event: ${eventId}`);
    if (!(await this.validateUploadLink(eventId, linkId))) {
      throw new Error("Invalid upload link");
    }

    // Implementation would go here...
    throw new Error("Not implemented");
  }

  async shareEvent(eventId: string): Promise<void> {
    console.log(`EventsService - Sharing event: ${eventId}`);
    // Implementation would go here...
    throw new Error("Not implemented");
  }

  async getEventById(
    eventId: string,
    creativeId?: string
  ): Promise<Event | null> {
    console.log(`EventsService - Fetching event with ID: ${eventId}`);
    try {
      const client = await this.getUnauthenticatedClient();

      if (creativeId) {
        // Use GetCommand when we have both eventId and creativeId
        const command = new GetCommand({
          TableName: TableNames.EVENTS,
          Key: {
            id: eventId,
            creativeId: creativeId,
          },
        });
        const response = await client.send(command);
        return (response.Item as Event) || null;
      } else {
        // Use QueryCommand when we only have eventId
        const command = new QueryCommand({
          TableName: TableNames.EVENTS,
          KeyConditionExpression: "id = :id",
          ExpressionAttributeValues: {
            ":id": eventId,
          },
          Limit: 1,
        });
        const response = await client.send(command);
        return (response.Items?.[0] as Event) || null;
      }
    } catch (error) {
      console.error("Error fetching event by ID:", error);
      throw new Error("Failed to fetch event");
    }
  }

  async deleteEvent(eventId: string, userId: string): Promise<void> {
    console.log(`EventsService - Deleting event: ${eventId}`);
    try {
      const client = await this.getUnauthenticatedClient();
      const command = new DeleteCommand({
        TableName: TableNames.EVENTS,
        Key: {
          id: eventId,
          creativeId: userId,
        },
      });

      await client.send(command);
    } catch (error) {
      console.error("Error deleting event:", error);
      throw new Error("Failed to delete event");
    }
  }

  async listEvents(userId: string): Promise<Event[]> {
    console.log(`EventsService - Listing events for user: ${userId}`);
    try {
      const credentials = await getCredentials();
      const client = new DynamoDBClient({
        region: import.meta.env.VITE_AWS_REGION,
        credentials,
      });

      const docClient = DynamoDBDocumentClient.from(client, {
        marshallOptions: {
          removeUndefinedValues: true,
          convertEmptyValues: true,
        },
      });

      const command = new QueryCommand({
        TableName: TableNames.EVENTS,
        IndexName: "CreativeIdIndex",
        KeyConditionExpression: "creativeId = :creativeId",
        ExpressionAttributeValues: {
          ":creativeId": userId,
        },
      });

      const response = await docClient.send(command);
      return (response.Items as Event[]) || [];
    } catch (error) {
      console.error("Error listing events:", error);
      throw new Error("Failed to list events");
    }
  }
}

// Create and export the singleton instance
const eventsServiceInstance = new EventsService();
export const eventsService = eventsServiceInstance;

// Export the operations object
export const eventOperations = {
  listEvents: async (creativeId: string): Promise<Event[]> => {
    return await eventsServiceInstance.listEvents(creativeId);
  },
  getPublicEventById: async (eventId: string): Promise<Event | null> => {
    return await eventsServiceInstance.getPublicEventById(eventId);
  },
  getEventById: async (
    eventId: string,
    creativeId?: string
  ): Promise<Event | null> => {
    return await eventsServiceInstance.getEventById(eventId, creativeId);
  },
  getFanEvents: async (userId: string): Promise<Event[]> => {
    return await eventsServiceInstance.getFanEvents(userId);
  },
  createEvent: (userId: string, eventData: EventFormData, flyerFile?: File) => {
    console.log("🚀 eventOperations.createEvent called with:", {
      userId: userId ? userId.substring(0, 8) + "..." : "undefined",
      eventDataName: eventData?.name,
      hasImage: !!flyerFile,
    });
    return eventsServiceInstance.createEvent(userId, eventData, flyerFile);
  },
  updateEvent: (eventId: string, userId: string, eventData: Partial<Event>) =>
    eventsServiceInstance.updateEvent(eventId, userId, eventData),
  deleteEvent: (eventId: string, userId: string) =>
    eventsServiceInstance.deleteEvent(eventId, userId),
  validateUploadLink: (eventId: string, linkId: string) =>
    eventsServiceInstance.validateUploadLink(eventId, linkId),
  getUploadConfig: (eventId: string, linkId: string) =>
    eventsServiceInstance.getUploadConfig(eventId, linkId),
  getPublicEvent: async (eventId: string): Promise<Event | null> => {
    return await eventsServiceInstance.getPublicEventById(eventId);
  },
  shareEvent: (eventId: string) => eventsServiceInstance.shareEvent(eventId),
  getUpcomingEventsByCreativeId: (creativeId: string) =>
    eventsServiceInstance.getUpcomingEventsByCreativeId(creativeId),
};
