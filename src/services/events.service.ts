import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Event } from "../types/events";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";

export class EventsService {
  private readonly tableName: string;
  private unauthClient: DynamoDBDocumentClient | null = null;

  constructor() {
    this.tableName = "dev-events";
    console.log("EventsService - Initializing with table:", this.tableName);
  }

  private async getUnauthenticatedClient(): Promise<DynamoDBDocumentClient> {
    if (this.unauthClient) return this.unauthClient;

    try {
      console.log("EventsService - Creating unauthenticated DynamoDB client");
      const region = import.meta.env.VITE_AWS_REGION;
      const identityPoolId = import.meta.env.VITE_IDENTITY_POOL_ID;

      // Create Cognito Identity client for unauthenticated access
      const identityClient = new CognitoIdentityClient({ region });

      // Create DynamoDB client with Cognito Identity Pool credentials
      const client = new DynamoDBClient({
        region,
        credentials: fromCognitoIdentityPool({
          client: identityClient,
          identityPoolId: identityPoolId,
          logins: {}, // Empty logins for unauthenticated access
        }),
      });

      this.unauthClient = DynamoDBDocumentClient.from(client, {
        marshallOptions: {
          removeUndefinedValues: true,
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
      const client = await this.getUnauthenticatedClient();
      const command = new GetCommand({
        TableName: this.tableName,
        Key: { id: eventId },
      });

      const response = await client.send(command);
      if (!response.Item) {
        console.log(`EventsService - No event found with ID: ${eventId}`);
        return null;
      }

      console.log(
        `EventsService - Successfully fetched public event:`,
        response.Item
      );
      return response.Item as Event;
    } catch (error) {
      console.error(`EventsService - Error fetching public event:`, error);
      throw new Error("Failed to fetch event details");
    }
  }
}
