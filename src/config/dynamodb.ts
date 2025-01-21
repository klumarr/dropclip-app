import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { stage } from "./env.config";

export const TableNames = {
  EVENTS: import.meta.env.VITE_EVENTS_TABLE || `${stage}-events`,
  UPLOADS: `${stage}-uploads`,
  USERS: `${stage}-users`,
  CONTENT: `${stage}-content`,
  COLLECTIONS: `${stage}-collections`,
  PLAYLISTS: `${stage}-playlists`,
  USER_PROFILES: `${stage}-user-profiles`,
  FOLLOWS: `${stage}-follows`,
  UPLOAD_LINKS: `${stage}-upload-links`,
  ATTENDANCE: `${stage}-attendance`,
  COLLECTION_UPLOADS: `${stage}-collection-uploads`,
} as const;

// DynamoDB Client setup
const client = new DynamoDBClient({
  region: import.meta.env.VITE_AWS_REGION,
});

export const docClient = DynamoDBDocumentClient.from(client);

// Type definitions
export interface UploadItem {
  id: string;
  eventId: string;
  userId: string;
  eventOwnerId: string;
  fileType: "video" | "image";
  fileUrl: string;
  fileKey: string; // S3 key for the file
  bucket: string; // S3 bucket name
  key: string; // S3 object key
  fileSize: number;
  thumbnailUrl?: string;
  thumbnailUrls?: string[];
  status:
    | "pending"
    | "processing"
    | "completed"
    | "rejected"
    | "approved"
    | "cancelled";
  processingStatus?: "pending" | "processing" | "completed" | "failed";
  metadata?: {
    duration?: number;
    width?: number;
    height?: number;
    codec?: string;
    bitrate?: number;
    fps?: number;
  };
  variants?: Array<{
    quality: string;
    url: string;
  }>;
  error?: string;
  uploadDate: string;
  userEventId: string;
  uploadDateEventId: string;
}

export interface UserItem {
  id: string;
  email: string;
  name: string;
  userType: "creative" | "fan";
  createdAt: string;
  updatedAt: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  socialLinks?: Record<string, string>;
  creativeType?: string;
  bookingAgent?: {
    name: string;
    email: string;
  };
  management?: {
    name: string;
    email: string;
  };
}

export interface UploadLinkItem {
  id: string;
  eventId: string;
  fanId: string;
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

export interface AttendanceItem {
  userId: string;
  eventId: string;
  createdAt: string;
  updatedAt: string;
  status: "attending" | "not_attending";
}

export interface FollowItem {
  fanId: string;
  creativeId: string;
  createdAt: string;
  updatedAt: string;
}
