import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import env from "./env.config";

const stage = import.meta.env.VITE_STAGE || "dev";

export const TableNames = {
  EVENTS: `${stage}-events`,
  UPLOADS: `${stage}-uploads`,
  USERS: `${stage}-users`,
  UPLOAD_LINKS: `${stage}-upload-links`,
  PLAYLISTS: `${stage}-playlists`,
  ATTENDANCE: `${stage}-attendance`,
  FOLLOWS: `${stage}-follows`,
  COLLECTIONS: `${stage}-collections`,
  COLLECTION_UPLOADS: `${stage}-collection-uploads`,
  NOTIFICATIONS: `${stage}-notifications`,
} as const;

// DynamoDB Client setup - only used in Lambda functions
const client = new DynamoDBClient({
  region: env.aws.region,
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
  eventOwnerId: string;
  fileType: "video" | "image";
  fileUrl: string;
  fileKey: string; // S3 key for the file
  thumbnailUrl?: string;
  thumbnailUrls?: string[];
  status: "pending" | "processing" | "completed" | "rejected" | "approved";
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

export interface NotificationItem {
  userId: string;
  id: string;
  status: "read" | "unread";
  type: "upload" | "moderation" | "system" | "download";
  message: string;
  createdAt: string;
  metadata?: Record<string, any>;
}
