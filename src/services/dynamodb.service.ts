import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient, TableNames } from "../config/dynamodb";
import { EventItem, UploadItem, UserItem } from "../config/dynamodb";
import { s3Operations } from "./s3.service";
import { cloudfrontOperations } from "./cloudfront.service";
import { lambdaOperations } from "./lambda.service";
import { getCredentials } from "./auth.service";

// Event Operations
export const eventOperations = {
  createEvent: async (
    event: Omit<EventItem, "createdAt" | "updatedAt" | "imageUrl">,
    flyerFile?: File
  ) => {
    const now = new Date().toISOString();
    let imageUrl = "";

    // Get AWS identity ID
    const credentials = await getCredentials();
    const identityId = credentials.identityId;
    console.log(
      "EventOperations - Got identity ID for event creation:",
      identityId
    );

    // Handle flyer upload if provided
    if (flyerFile) {
      const fileKey = s3Operations.generateFlyerKey(event.id, flyerFile.name);
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

      // Get the CloudFront URL for the flyer
      imageUrl = cloudfrontOperations.getFileUrl(fileKey);
    }

    const item: EventItem = {
      ...event,
      identityId,
      imageUrl,
      createdAt: now,
      updatedAt: now,
      dateId: event.date.substring(0, 7), // YYYY-MM
      dateCreativeId: `${event.date}#${event.creativeId}`,
    };

    await docClient.send(
      new PutCommand({
        TableName: TableNames.EVENTS,
        Item: item,
      })
    );
    return item;
  },

  getEvent: async (id: string, creativeId: string) => {
    const response = await docClient.send(
      new GetCommand({
        TableName: TableNames.EVENTS,
        Key: { id, creativeId },
      })
    );
    return response.Item as EventItem | undefined;
  },

  listCreativeEvents: async (creativeId: string) => {
    const response = await docClient.send(
      new QueryCommand({
        TableName: TableNames.EVENTS,
        KeyConditionExpression: "creativeId = :creativeId",
        ExpressionAttributeValues: {
          ":creativeId": creativeId,
        },
      })
    );
    return response.Items as EventItem[];
  },

  updateEvent: async (
    id: string,
    creativeId: string,
    updates: Partial<EventItem>
  ) => {
    // Get AWS identity ID
    const credentials = await getCredentials();
    const identityId = credentials.identityId;
    console.log(
      "EventOperations - Got identity ID for event update:",
      identityId
    );

    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== "id" && key !== "creativeId") {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    // Always update the updatedAt timestamp and identityId
    updateExpressions.push("#updatedAt = :updatedAt");
    expressionAttributeNames["#updatedAt"] = "updatedAt";
    expressionAttributeValues[":updatedAt"] = new Date().toISOString();

    updateExpressions.push("#identityId = :identityId");
    expressionAttributeNames["#identityId"] = "identityId";
    expressionAttributeValues[":identityId"] = identityId;

    await docClient.send(
      new UpdateCommand({
        TableName: TableNames.EVENTS,
        Key: { id, creativeId },
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      })
    );
  },

  deleteEvent: async (id: string, creativeId: string): Promise<void> => {
    try {
      // Get the event first to check if it has an image
      const event = await eventOperations.getEvent(id, creativeId);

      // Delete the event from DynamoDB
      await docClient.send(
        new DeleteCommand({
          TableName: TableNames.EVENTS,
          Key: { id, creativeId },
        })
      );

      // If event had an image, invalidate its cache
      if (event?.imageUrl) {
        await cloudfrontOperations.invalidateEventCache(id);
      }
    } catch (error) {
      console.error(`Error deleting event ${id}:`, error);
      throw error;
    }
  },
};

// Upload Operations
export const uploadOperations = {
  createUpload: async (
    upload: Omit<UploadItem, "uploadDate" | "fileUrl" | "thumbnailUrl">,
    file: File
  ) => {
    const fileKey = s3Operations.generateFileKey(
      upload.eventId,
      upload.userId,
      file.name
    );
    const uploadUrl = await s3Operations.getUploadUrl(fileKey, file.type);

    // Upload the file
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    // Get the CloudFront URL for the file
    const fileUrl = cloudfrontOperations.getFileUrl(fileKey);

    const item: UploadItem = {
      ...upload,
      fileUrl,
      uploadDate: new Date().toISOString(),
      userEventId: upload.userId,
      uploadDateEventId: `${new Date().toISOString()}#${upload.eventId}`,
    };

    await docClient.send(
      new PutCommand({
        TableName: TableNames.UPLOADS,
        Item: item,
      })
    );

    // Trigger video processing if it's a video file
    if (upload.fileType === "video") {
      try {
        await lambdaOperations.triggerVideoProcessing({
          uploadId: item.id,
          eventId: item.eventId,
          fileKey,
        });
      } catch (error) {
        console.error("Failed to trigger video processing:", error);
        // Update upload status to indicate processing failure
        await uploadOperations.updateUploadStatus(
          item.id,
          item.eventId,
          "rejected"
        );
        throw error;
      }
    }

    return item;
  },

  getUpload: async (id: string, eventId: string) => {
    const response = await docClient.send(
      new GetCommand({
        TableName: TableNames.UPLOADS,
        Key: { id, eventId },
      })
    );
    return response.Item as UploadItem | undefined;
  },

  listEventUploads: async (eventId: string) => {
    const response = await docClient.send(
      new QueryCommand({
        TableName: TableNames.UPLOADS,
        KeyConditionExpression: "eventId = :eventId",
        ExpressionAttributeValues: {
          ":eventId": eventId,
        },
      })
    );
    return response.Items as UploadItem[];
  },

  listUserUploads: async (userId: string) => {
    const response = await docClient.send(
      new QueryCommand({
        TableName: TableNames.UPLOADS,
        IndexName: "UserUploadsIndex",
        KeyConditionExpression: "userEventId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
    );
    return response.Items as UploadItem[];
  },

  updateUploadStatus: async (
    id: string,
    eventId: string,
    status: UploadItem["status"]
  ) => {
    await docClient.send(
      new UpdateCommand({
        TableName: TableNames.UPLOADS,
        Key: { id, eventId },
        UpdateExpression: "SET #status = :status",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":status": status },
      })
    );

    // Invalidate CloudFront cache for this upload
    await cloudfrontOperations.invalidateUploadCache(eventId, id);
  },
};

// User Operations
export const userOperations = {
  createUser: async (user: Omit<UserItem, "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const item: UserItem = {
      ...user,
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: TableNames.USERS,
        Item: item,
      })
    );
    return item;
  },

  getUser: async (id: string) => {
    const response = await docClient.send(
      new GetCommand({
        TableName: TableNames.USERS,
        Key: { id },
      })
    );
    return response.Item as UserItem | undefined;
  },

  updateUser: async (id: string, updates: Partial<UserItem>) => {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== "id") {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    // Always update the updatedAt timestamp
    updateExpressions.push("#updatedAt = :updatedAt");
    expressionAttributeNames["#updatedAt"] = "updatedAt";
    expressionAttributeValues[":updatedAt"] = new Date().toISOString();

    await docClient.send(
      new UpdateCommand({
        TableName: TableNames.USERS,
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      })
    );
  },
};
