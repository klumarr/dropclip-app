export interface NotificationItem {
  userId: string;
  id: string;
  type: NotificationType;
  status: "read" | "unread";
  message: string;
  createdAt: string;
  metadata?: {
    count?: number;
    uploadId?: string;
    eventId?: string;
    [key: string]: any;
  };
}

export enum NotificationType {
  UPLOAD_COMPLETE = "UPLOAD_COMPLETE",
  UPLOAD_FAILED = "UPLOAD_FAILED",
  NEW_FOLLOWER = "NEW_FOLLOWER",
  NEW_COMMENT = "NEW_COMMENT",
  NEW_LIKE = "NEW_LIKE",
  CONTENT_APPROVED = "CONTENT_APPROVED",
  CONTENT_REJECTED = "CONTENT_REJECTED",
  SYSTEM = "SYSTEM",
  DOWNLOAD = "DOWNLOAD",
}

export type NotificationStatus = NotificationItem["status"];

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  status: NotificationStatus;
  message: string;
  metadata?: {
    count?: number;
    uploadId?: string;
    eventId?: string;
    [key: string]: any;
  };
}
