// Notification type definition
export type NotificationType = "upload" | "moderation" | "system" | "social";
export type NotificationStatus = "read" | "unread";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  status: NotificationStatus;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// Notification preferences interface
export interface NotificationPreferences {
  events: boolean;
  videos: boolean;
  social: boolean;
  system: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}
