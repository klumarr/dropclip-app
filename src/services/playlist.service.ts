import { v4 as uuidv4 } from "uuid";
import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { TableNames, PlaylistItem } from "../config/dynamodb";
import { docClient } from "../config/dynamodb";

// Type assertion to ensure docClient is of the correct type
const client: DynamoDBDocumentClient = docClient;

export const playlistOperations = {
  createPlaylist: async (
    userId: string,
    name: string,
    description?: string,
    isPublic: boolean = false
  ): Promise<PlaylistItem> => {
    const now = new Date().toISOString();
    const playlist: PlaylistItem = {
      id: uuidv4(),
      userId,
      name,
      description,
      uploadIds: [],
      createdAt: now,
      updatedAt: now,
      isPublic,
    };

    await client.send(
      new PutCommand({
        TableName: TableNames.PLAYLISTS,
        Item: playlist,
      })
    );

    return playlist;
  },

  getPlaylist: async (playlistId: string): Promise<PlaylistItem | null> => {
    const result = await client.send(
      new GetCommand({
        TableName: TableNames.PLAYLISTS,
        Key: { id: playlistId },
      })
    );

    return (result.Item as PlaylistItem) || null;
  },

  listUserPlaylists: async (userId: string): Promise<PlaylistItem[]> => {
    const result = await client.send(
      new QueryCommand({
        TableName: TableNames.PLAYLISTS,
        IndexName: "userIdIndex",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
    );

    return (result.Items as PlaylistItem[]) || [];
  },

  addToPlaylist: async (
    playlistId: string,
    uploadId: string
  ): Promise<void> => {
    await client.send(
      new UpdateCommand({
        TableName: TableNames.PLAYLISTS,
        Key: { id: playlistId },
        UpdateExpression:
          "SET uploadIds = list_append(if_not_exists(uploadIds, :empty_list), :uploadId)",
        ExpressionAttributeValues: {
          ":uploadId": [uploadId],
          ":empty_list": [],
        },
      })
    );
  },

  removeFromPlaylist: async (
    playlistId: string,
    uploadId: string
  ): Promise<void> => {
    const playlist = await playlistOperations.getPlaylist(playlistId);
    if (!playlist) return;

    const updatedUploadIds = playlist.uploadIds.filter((id) => id !== uploadId);

    await client.send(
      new UpdateCommand({
        TableName: TableNames.PLAYLISTS,
        Key: { id: playlistId },
        UpdateExpression: "SET uploadIds = :uploadIds",
        ExpressionAttributeValues: {
          ":uploadIds": updatedUploadIds,
        },
      })
    );
  },

  updatePlaylist: async (
    playlistId: string,
    updates: Partial<
      Pick<PlaylistItem, "name" | "description" | "isPublic" | "thumbnailUrl">
    >
  ): Promise<void> => {
    const updateExpressions: string[] = [];
    const expressionAttributeValues: { [key: string]: any } = {};
    const expressionAttributeNames: { [key: string]: string } = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeValues[`:${key}`] = value;
        expressionAttributeNames[`#${key}`] = key;
      }
    });

    if (updateExpressions.length > 0) {
      updateExpressions.push("#updatedAt = :updatedAt");
      expressionAttributeValues[":updatedAt"] = new Date().toISOString();
      expressionAttributeNames["#updatedAt"] = "updatedAt";

      await client.send(
        new UpdateCommand({
          TableName: TableNames.PLAYLISTS,
          Key: { id: playlistId },
          UpdateExpression: `SET ${updateExpressions.join(", ")}`,
          ExpressionAttributeValues: expressionAttributeValues,
          ExpressionAttributeNames: expressionAttributeNames,
        })
      );
    }
  },

  deletePlaylist: async (playlistId: string): Promise<void> => {
    await client.send(
      new DeleteCommand({
        TableName: TableNames.PLAYLISTS,
        Key: { id: playlistId },
      })
    );
  },
};
