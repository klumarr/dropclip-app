import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { TableNames } from "../config/dynamodb";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { AuthUser } from "../types/auth.types";
import { createAWSClient } from "./aws-client.factory";
import { getCredentials } from "./auth.service";

class UserService {
  private docClient: DynamoDBDocumentClient | null = null;
  private unauthClient: DynamoDBDocumentClient | null = null;

  private async getUnauthenticatedClient(): Promise<DynamoDBDocumentClient> {
    if (this.unauthClient) return this.unauthClient;

    try {
      console.log("UserService - Creating unauthenticated DynamoDB client");
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

      console.log("UserService - Successfully created unauthenticated client");
      return this.unauthClient;
    } catch (error) {
      console.error(
        "UserService - Failed to create unauthenticated client:",
        error
      );
      throw new Error("Failed to initialize database connection");
    }
  }

  private async getAuthenticatedClient(): Promise<DynamoDBDocumentClient> {
    if (this.docClient) return this.docClient;

    try {
      console.log("UserService - Creating authenticated DynamoDB client");
      const credentials = await getCredentials();
      const client = await createAWSClient(DynamoDBClient);

      this.docClient = DynamoDBDocumentClient.from(client, {
        marshallOptions: {
          removeUndefinedValues: true,
          convertEmptyValues: true,
        },
      });

      console.log("UserService - Successfully created authenticated client");
      return this.docClient;
    } catch (error) {
      console.error(
        "UserService - Failed to create authenticated client:",
        error
      );
      throw new Error("Failed to initialize database connection");
    }
  }

  async getPublicProfile(userId: string): Promise<AuthUser | null> {
    console.log(`UserService - Fetching public profile for user: ${userId}`);
    try {
      // Try to get the authenticated client first, fall back to unauthenticated
      let client;
      try {
        client = await this.getAuthenticatedClient();
        console.log("UserService - Using authenticated client");
      } catch (error) {
        client = await this.getUnauthenticatedClient();
        console.log("UserService - Using unauthenticated client");
      }

      const tableName = TableNames.USERS;
      console.log(`UserService - Using table name: ${tableName}`);

      const command = new GetCommand({
        TableName: tableName,
        Key: {
          id: userId,
        },
      });

      const response = await client.send(command);
      if (!response.Item) {
        console.log(`UserService - No profile found for user: ${userId}`);
        return null;
      }

      const user = response.Item as AuthUser;
      console.log("UserService - Successfully fetched public profile:", user);
      return user;
    } catch (error) {
      console.error("UserService - Error fetching public profile:", error);
      throw new Error("Failed to fetch user profile");
    }
  }
}

// Create and export the singleton instance
const userServiceInstance = new UserService();
export const userService = userServiceInstance;
