import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { TableNames } from "../config/dynamodb";
import { Collection, CollectionUpload } from "../types/collections";
import { Upload } from "../types/uploads";

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

export class CollectionService {
  static async createCollection(
    creativeId: string,
    name: string,
    description?: string
  ): Promise<Collection> {
    const now = new Date().toISOString();
    const collection: Collection = {
      id: `col_${Date.now()}`,
      creativeId,
      name,
      description,
      createdAt: now,
      modifiedAt: now,
      uploadCount: 0,
    };

    try {
      await docClient.send(
        new PutCommand({
          TableName: TableNames.COLLECTIONS,
          Item: collection,
        })
      );

      return collection;
    } catch (error) {
      console.error("Error creating collection:", error);
      throw new Error("Failed to create collection");
    }
  }

  static async getCollection(collectionId: string): Promise<Collection | null> {
    try {
      const response = await docClient.send(
        new GetCommand({
          TableName: TableNames.COLLECTIONS,
          Key: { id: collectionId },
        })
      );

      return (response.Item as Collection) || null;
    } catch (error) {
      console.error("Error getting collection:", error);
      throw new Error("Failed to get collection");
    }
  }

  static async getCreativeCollections(
    creativeId: string
  ): Promise<Collection[]> {
    try {
      const response = await docClient.send(
        new QueryCommand({
          TableName: TableNames.COLLECTIONS,
          IndexName: "CreativeIdIndex",
          KeyConditionExpression: "creativeId = :creativeId",
          ExpressionAttributeValues: {
            ":creativeId": creativeId,
          },
        })
      );

      return (response.Items as Collection[]) || [];
    } catch (error) {
      console.error("Error getting creative collections:", error);
      throw new Error("Failed to get collections");
    }
  }

  static async updateCollection(
    collectionId: string,
    updates: Partial<Collection>
  ): Promise<void> {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {
      ":modifiedAt": new Date().toISOString(),
    };

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== "id" && key !== "creativeId" && value !== undefined) {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    updateExpressions.push("#modifiedAt = :modifiedAt");
    expressionAttributeNames["#modifiedAt"] = "modifiedAt";

    try {
      await docClient.send(
        new UpdateCommand({
          TableName: TableNames.COLLECTIONS,
          Key: { id: collectionId },
          UpdateExpression: `SET ${updateExpressions.join(", ")}`,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
        })
      );
    } catch (error) {
      console.error("Error updating collection:", error);
      throw new Error("Failed to update collection");
    }
  }

  static async deleteCollection(collectionId: string): Promise<void> {
    try {
      await docClient.send(
        new DeleteCommand({
          TableName: TableNames.COLLECTIONS,
          Key: { id: collectionId },
        })
      );
    } catch (error) {
      console.error("Error deleting collection:", error);
      throw new Error("Failed to delete collection");
    }
  }

  static async addUploadToCollection(
    collectionId: string,
    uploadId: string
  ): Promise<void> {
    const now = new Date().toISOString();
    const collectionUpload: CollectionUpload = {
      collectionId,
      uploadId,
      addedAt: now,
      position: Date.now(), // Simple position based on timestamp
    };

    try {
      // Add to collection_uploads table
      await docClient.send(
        new PutCommand({
          TableName: TableNames.COLLECTION_UPLOADS,
          Item: collectionUpload,
        })
      );

      // Increment upload count in collection
      await docClient.send(
        new UpdateCommand({
          TableName: TableNames.COLLECTIONS,
          Key: { id: collectionId },
          UpdateExpression:
            "SET uploadCount = uploadCount + :inc, modifiedAt = :now",
          ExpressionAttributeValues: {
            ":inc": 1,
            ":now": now,
          },
        })
      );
    } catch (error) {
      console.error("Error adding upload to collection:", error);
      throw new Error("Failed to add upload to collection");
    }
  }

  static async removeUploadFromCollection(
    collectionId: string,
    uploadId: string
  ): Promise<void> {
    const now = new Date().toISOString();

    try {
      // Remove from collection_uploads table
      await docClient.send(
        new DeleteCommand({
          TableName: TableNames.COLLECTION_UPLOADS,
          Key: {
            collectionId,
            uploadId,
          },
        })
      );

      // Decrement upload count in collection
      await docClient.send(
        new UpdateCommand({
          TableName: TableNames.COLLECTIONS,
          Key: { id: collectionId },
          UpdateExpression:
            "SET uploadCount = uploadCount - :dec, modifiedAt = :now",
          ExpressionAttributeValues: {
            ":dec": 1,
            ":now": now,
          },
          ConditionExpression: "uploadCount > :zero",
          ExpressionAttributeValues: {
            ":dec": 1,
            ":now": now,
            ":zero": 0,
          },
        })
      );
    } catch (error) {
      console.error("Error removing upload from collection:", error);
      throw new Error("Failed to remove upload from collection");
    }
  }

  static async getCollectionUploads(collectionId: string): Promise<Upload[]> {
    try {
      // Get collection uploads with positions
      const collectionUploadsResponse = await docClient.send(
        new QueryCommand({
          TableName: TableNames.COLLECTION_UPLOADS,
          KeyConditionExpression: "collectionId = :collectionId",
          ExpressionAttributeValues: {
            ":collectionId": collectionId,
          },
        })
      );

      const collectionUploads =
        collectionUploadsResponse.Items as CollectionUpload[];

      // Get the actual upload details
      const uploadPromises = collectionUploads.map((cu) =>
        docClient.send(
          new GetCommand({
            TableName: TableNames.UPLOADS,
            Key: { id: cu.uploadId },
          })
        )
      );

      const uploadResponses = await Promise.all(uploadPromises);
      const uploads = uploadResponses
        .map((response) => response.Item as Upload)
        .filter((upload): upload is Upload => upload !== undefined)
        .sort((a, b) => {
          const aPosition =
            collectionUploads.find((cu) => cu.uploadId === a.id)?.position || 0;
          const bPosition =
            collectionUploads.find((cu) => cu.uploadId === b.id)?.position || 0;
          return aPosition - bPosition;
        });

      return uploads;
    } catch (error) {
      console.error("Error getting collection uploads:", error);
      throw new Error("Failed to get collection uploads");
    }
  }
}
