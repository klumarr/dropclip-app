import {
  PutCommand,
  GetCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../config/dynamodb";

interface FollowItem {
  fanId: string;
  creativeId: string;
  createdAt: string;
  updatedAt: string;
}

class FollowService {
  private readonly tableName = `${process.env.VITE_STAGE || "dev"}-follows`;

  async followCreative(fanId: string, creativeId: string): Promise<void> {
    const now = new Date().toISOString();
    const item: FollowItem = {
      fanId,
      creativeId,
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: item,
      })
    );
  }

  async unfollowCreative(fanId: string, creativeId: string): Promise<void> {
    await docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { fanId, creativeId },
      })
    );
  }

  async checkFollowStatus(fanId: string, creativeId: string): Promise<boolean> {
    const response = await docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { fanId, creativeId },
      })
    );
    return !!response.Item;
  }

  async getCreativeFollowers(creativeId: string): Promise<string[]> {
    const response = await docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: "CreativeFollowersIndex",
        KeyConditionExpression: "creativeId = :creativeId",
        ExpressionAttributeValues: {
          ":creativeId": creativeId,
        },
      })
    );
    return (response.Items as FollowItem[]).map((item) => item.fanId);
  }

  async getFanFollowing(fanId: string): Promise<string[]> {
    const response = await docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "fanId = :fanId",
        ExpressionAttributeValues: {
          ":fanId": fanId,
        },
      })
    );
    return (response.Items as FollowItem[]).map((item) => item.creativeId);
  }
}

export const followService = new FollowService();
