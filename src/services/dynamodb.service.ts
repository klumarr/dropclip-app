import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient, TableNames } from "../config/dynamodb";
import { EventItem, UploadItem, UserItem } from "../config/dynamodb";

// Event Operations
export const eventOperations = {
  createEvent: async (event: Omit<EventItem, "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const item: EventItem = {
      ...event,
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

    // Always update the updatedAt timestamp
    updateExpressions.push("#updatedAt = :updatedAt");
    expressionAttributeNames["#updatedAt"] = "updatedAt";
    expressionAttributeValues[":updatedAt"] = new Date().toISOString();

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
};

// Upload Operations
export const uploadOperations = {
  createUpload: async (upload: Omit<UploadItem, "uploadDate">) => {
    const item: UploadItem = {
      ...upload,
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
