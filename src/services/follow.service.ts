import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { TableNames } from "../config/dynamodb";
import { getAWSClient } from "./aws-client.factory";
import { getCurrentUser } from "aws-amplify/auth";

class FollowService {
  private async getClient() {
    try {
      const client = await getAWSClient(DynamoDBClient);
      return DynamoDBDocumentClient.from(client);
    } catch (error) {
      console.error("Failed to create DynamoDB client:", error);
      throw error;
    }
  }

  private async getUserId() {
    try {
      const user = await getCurrentUser();
      if (!user?.userId) {
        throw new Error("No authenticated user found");
      }
      return user.userId;
    } catch (error) {
      console.error("Error getting user ID:", error);
      throw error;
    }
  }

  private async updateFollowerCount(creativeId: string, increment: boolean) {
    try {
      console.log(
        `Updating follower count for creative ${creativeId}, ${
          increment ? "increment" : "decrement"
        }`
      );
      const client = await this.getClient();

      const command = new UpdateCommand({
        TableName: TableNames.USERS,
        Key: { id: creativeId },
        UpdateExpression:
          "SET followerCount = if_not_exists(followerCount, :zero) + :inc",
        ExpressionAttributeValues: {
          ":inc": increment ? 1 : -1,
          ":zero": 0,
        },
        ReturnValues: "UPDATED_NEW",
      });

      const response = await client.send(command);
      console.log("Successfully updated follower count:", response.Attributes);
      return response.Attributes?.followerCount;
    } catch (error) {
      console.error("Error updating follower count:", error);
      throw new Error("Failed to update follower count");
    }
  }

  async followCreative(creativeId: string) {
    try {
      console.log("Following creative:", creativeId);
      const client = await this.getClient();
      const userId = await this.getUserId();

      // First check if already following
      const isAlreadyFollowing = await this.checkFollowStatus(creativeId);
      if (isAlreadyFollowing) {
        console.log("Already following creative:", creativeId);
        return;
      }

      // Start transaction: Add follow record and update counter
      const command = new PutCommand({
        TableName: TableNames.FOLLOWS,
        Item: {
          fanId: userId,
          creativeId: creativeId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        // Ensure we don't overwrite an existing follow
        ConditionExpression:
          "attribute_not_exists(fanId) AND attribute_not_exists(creativeId)",
      });

      await client.send(command);
      await this.updateFollowerCount(creativeId, true);
      console.log("Successfully followed creative:", creativeId);
    } catch (error) {
      console.error("Error following creative:", error);
      if (error.name === "ConditionalCheckFailedException") {
        throw new Error("Already following this creative");
      }
      throw new Error("Failed to follow creative. Please try again.");
    }
  }

  async unfollowCreative(creativeId: string) {
    try {
      console.log("Unfollowing creative:", creativeId);
      const client = await this.getClient();
      const userId = await this.getUserId();

      // First check if actually following
      const isFollowing = await this.checkFollowStatus(creativeId);
      if (!isFollowing) {
        console.log("Not following creative:", creativeId);
        return;
      }

      // Start transaction: Remove follow record and update counter
      const command = new DeleteCommand({
        TableName: TableNames.FOLLOWS,
        Key: {
          fanId: userId,
          creativeId: creativeId,
        },
        // Ensure the follow record exists before deleting
        ConditionExpression:
          "attribute_exists(fanId) AND attribute_exists(creativeId)",
      });

      await client.send(command);
      await this.updateFollowerCount(creativeId, false);
      console.log("Successfully unfollowed creative:", creativeId);
    } catch (error) {
      console.error("Error unfollowing creative:", error);
      if (error.name === "ConditionalCheckFailedException") {
        throw new Error("Not following this creative");
      }
      throw new Error("Failed to unfollow creative. Please try again.");
    }
  }

  async checkFollowStatus(creativeId: string): Promise<boolean> {
    try {
      console.log("Checking follow status for creative:", creativeId);
      const client = await this.getClient();
      const userId = await this.getUserId();

      const command = new QueryCommand({
        TableName: TableNames.FOLLOWS,
        KeyConditionExpression: "fanId = :fanId AND creativeId = :creativeId",
        ExpressionAttributeValues: {
          ":fanId": userId,
          ":creativeId": creativeId,
        },
      });

      const response = await client.send(command);
      const isFollowing = (response.Items?.length ?? 0) > 0;
      console.log("Follow status check result:", isFollowing);
      return isFollowing;
    } catch (error) {
      if (error.message === "No authenticated user found") {
        console.log("No authenticated user, returning false for follow status");
        return false;
      }
      console.error("Error checking follow status:", error);
      throw new Error("Failed to check follow status. Please try again.");
    }
  }
}

export const followService = new FollowService();
