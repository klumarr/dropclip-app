import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const stage = import.meta.env.VITE_STAGE || "dev";

export const TableNames = {
  EVENTS: `${stage}-events`,
  UPLOADS: `${stage}-uploads`,
  USERS: `${stage}-users`,
  UPLOAD_LINKS: `${stage}-upload-links`,
  PLAYLISTS: `${stage}-playlists`,
} as const;

// DynamoDB Client setup
const client = new DynamoDBClient({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID!,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY!,
  },
});

export const docClient = DynamoDBDocumentClient.from(client);

// Type definitions
export interface EventItem {
  id: string;
  creativeId: string;
  name: string;
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  dateId: string; // YYYY-MM
  dateCreativeId: string; // date#creativeId
}

export interface UploadItem {
  id: string;
  eventId: string;
  userId: string;
  fileType: "video" | "image";
  fileUrl: string;
  thumbnailUrl?: string;
  status: "pending" | "processing" | "completed" | "rejected";
  uploadDate: string;
  userEventId: string; // userId (for GSI)
  uploadDateEventId: string; // uploadDate#eventId (for GSI)
}

export interface UserItem {
  id: string;
  email: string;
  name: string;
  userType: "creative" | "fan";
  createdAt: string;
  updatedAt: string;
}

export interface UploadLinkItem {
  id: string;
  eventId: string;
  creativeId: string;
  expiresAt: string;
  maxUploads: number;
  currentUploads: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistItem {
  id: string;
  userId: string;
  name: string;
  description?: string;
  uploadIds: string[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  thumbnailUrl?: string;
}
