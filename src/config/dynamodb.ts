import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// DynamoDB Client configuration
const client = new DynamoDBClient({
  region: process.env.REACT_APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY!,
  },
});

// Create document client for easier JSON handling
export const docClient = DynamoDBDocumentClient.from(client);

// Table names
export const TableNames = {
  EVENTS: `${process.env.REACT_APP_STAGE}-events`,
  UPLOADS: `${process.env.REACT_APP_STAGE}-uploads`,
  USERS: `${process.env.REACT_APP_STAGE}-users`,
} as const;

// Schema definitions for type safety
export interface EventItem {
  id: string; // Partition key
  creativeId: string; // Sort key
  title: string;
  date: string;
  location: string;
  description: string;
  imageUrl: string;
  uploadConfig: {
    enabled: boolean;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    maxFileSize: number;
    allowedTypes: string[];
  };
  createdAt: string;
  updatedAt: string;
  status: "active" | "cancelled" | "completed";
  // GSI for listing events by date
  dateId: string; // GSI partition key (YYYY-MM)
  dateCreativeId: string; // GSI sort key (date#creativeId)
}

export interface UploadItem {
  id: string; // Partition key
  eventId: string; // Sort key
  userId: string;
  userName: string;
  fileType: "image" | "video";
  fileUrl: string;
  thumbnailUrl?: string;
  uploadDate: string;
  status: "pending" | "approved" | "rejected";
  size: number;
  metadata: {
    duration?: number;
    resolution?: string;
    mimeType: string;
  };
  // GSI for listing uploads by user
  userEventId: string; // GSI partition key (userId)
  uploadDateEventId: string; // GSI sort key (uploadDate#eventId)
}

export interface UserItem {
  id: string; // Partition key (Cognito sub)
  email: string;
  name: string;
  userType: "creative" | "fan";
  profilePicture?: string;
  linkedAccounts?: {
    creative?: string;
    fan?: string;
  };
  isDormantCreative?: boolean;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    theme: "light" | "dark" | "system";
  };
  createdAt: string;
  updatedAt: string;
}

// DynamoDB table configurations
export const TableConfigs = {
  Events: {
    TableName: TableNames.EVENTS,
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" },
      { AttributeName: "creativeId", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "creativeId", AttributeType: "S" },
      { AttributeName: "dateId", AttributeType: "S" },
      { AttributeName: "dateCreativeId", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "DateIndex",
        KeySchema: [
          { AttributeName: "dateId", KeyType: "HASH" },
          { AttributeName: "dateCreativeId", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  Uploads: {
    TableName: TableNames.UPLOADS,
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" },
      { AttributeName: "eventId", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "eventId", AttributeType: "S" },
      { AttributeName: "userEventId", AttributeType: "S" },
      { AttributeName: "uploadDateEventId", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "UserUploadsIndex",
        KeySchema: [
          { AttributeName: "userEventId", KeyType: "HASH" },
          { AttributeName: "uploadDateEventId", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  Users: {
    TableName: TableNames.USERS,
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
  },
} as const;
