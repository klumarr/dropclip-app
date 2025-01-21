import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { TableNames } from "../config/dynamodb";
import {
  getAuthenticatedClient,
  getUnauthenticatedClient,
} from "../utils/aws-client.factory";
import { UserType } from "../types/auth.types";

interface CreateUserInput {
  id: string; // Cognito sub
  email: string;
  userType: UserType;
  displayName: string; // Initially set to email username
  username: string; // Generated from email
  socialLinks?: Record<string, string>; // Available for all users
  // Creative-only fields
  bio?: string;
  avatarUrl?: string;
}

interface UpdateUserProfileInput {
  id: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  socialLinks?: Record<string, string>;
  creativeType?: string;
  bookingAgent?: {
    name: string;
    email: string;
    phone?: string;
  };
  management?: {
    name: string;
    email: string;
    phone?: string;
  };
}

class UserService {
  async getPublicProfile(userId: string) {
    console.log("🔍 UserService - Fetching public profile for user:", userId);
    try {
      // Try authenticated client first
      const client = await getAuthenticatedClient();
      console.log("🔑 UserService - Using authenticated client");

      const command = new GetCommand({
        TableName: TableNames.USERS,
        Key: { id: userId },
      });

      const response = await client.send(command);
      console.log("📦 UserService - Profile data:", response.Item);

      return response.Item;
    } catch (error) {
      console.error("❌ UserService - Error fetching profile:", error);

      // Fall back to unauthenticated client
      try {
        console.log("🔑 UserService - Falling back to unauthenticated client");
        const client = await getUnauthenticatedClient();

        const command = new GetCommand({
          TableName: TableNames.USERS,
          Key: { id: userId },
        });

        const response = await client.send(command);
        console.log("📦 UserService - Profile data (unauth):", response.Item);

        return response.Item;
      } catch (fallbackError) {
        console.error(
          "❌ UserService - Error fetching profile (unauth):",
          fallbackError
        );
        throw fallbackError;
      }
    }
  }

  async createUserRecord(input: CreateUserInput) {
    console.log("➕ UserService - Creating user record:", input);
    try {
      const client = await getAuthenticatedClient();

      const now = new Date().toISOString();
      const baseRecord = {
        id: input.id,
        email: input.email,
        userType: input.userType,
        displayName: input.displayName,
        username: input.username,
        socialLinks: input.socialLinks || {}, // Include social links for all users
        createdAt: now,
        updatedAt: now,
      };

      // Add creative-specific fields only for creative users
      const fullRecord =
        input.userType === "CREATIVE"
          ? {
              ...baseRecord,
              bio: input.bio || "",
              avatarUrl: input.avatarUrl || "",
            }
          : baseRecord;

      const command = new PutCommand({
        TableName: TableNames.USERS,
        Item: fullRecord,
      });

      await client.send(command);
      console.log("✅ UserService - User record created successfully");

      return true;
    } catch (error) {
      console.error("❌ UserService - Error creating user record:", error);
      throw error;
    }
  }

  async updateUserProfile(input: UpdateUserProfileInput) {
    console.log("✏️ UserService - Updating user profile:", input);
    try {
      const client = await getAuthenticatedClient();

      // Build update expression and attribute values
      let updateExpression = "SET updatedAt = :updatedAt";
      const expressionAttributeValues: Record<string, any> = {
        ":updatedAt": new Date().toISOString(),
      };

      // Add optional fields to update expression
      if (input.displayName) {
        updateExpression += ", displayName = :displayName";
        expressionAttributeValues[":displayName"] = input.displayName;
      }

      if (input.bio !== undefined) {
        updateExpression += ", bio = :bio";
        expressionAttributeValues[":bio"] = input.bio;
      }

      if (input.avatarUrl !== undefined) {
        updateExpression += ", avatarUrl = :avatarUrl";
        expressionAttributeValues[":avatarUrl"] = input.avatarUrl;
      }

      if (input.socialLinks !== undefined) {
        updateExpression += ", socialLinks = :socialLinks";
        expressionAttributeValues[":socialLinks"] = input.socialLinks;
      }

      if (input.creativeType !== undefined) {
        updateExpression += ", creativeType = :creativeType";
        expressionAttributeValues[":creativeType"] = input.creativeType;
      }

      if (input.bookingAgent !== undefined) {
        updateExpression += ", bookingAgent = :bookingAgent";
        expressionAttributeValues[":bookingAgent"] = input.bookingAgent;
      }

      if (input.management !== undefined) {
        updateExpression += ", management = :management";
        expressionAttributeValues[":management"] = input.management;
      }

      const command = new UpdateCommand({
        TableName: TableNames.USERS,
        Key: { id: input.id },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
      });

      const response = await client.send(command);
      console.log(
        "✅ UserService - Profile updated successfully:",
        response.Attributes
      );

      return response.Attributes;
    } catch (error) {
      console.error("❌ UserService - Error updating user profile:", error);
      throw error;
    }
  }
}

export const userService = new UserService();
