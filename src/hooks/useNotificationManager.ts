import { useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  notificationService,
  Notification,
} from "../services/notification.service";
import { useNotifications } from "../contexts/NotificationContext";

export const useNotificationManager = () => {
  const { user } = useAuth();
  const { refreshNotifications } = useNotifications();

  const createNotification = useCallback(
    async (
      type: Notification["type"],
      title: string,
      message: string,
      options?: {
        actionUrl?: string;
        metadata?: Notification["metadata"];
        shouldGroup?: boolean;
      }
    ) => {
      if (!user?.id) return;

      try {
        if (options?.shouldGroup) {
          await notificationService.createGroupedNotification(
            user.id,
            type,
            title,
            message,
            options.metadata
          );
        } else {
          await notificationService.createNotification({
            userId: user.id,
            type,
            status: "unread",
            title,
            message,
            actionUrl: options?.actionUrl,
            metadata: options?.metadata,
          });
        }
        await refreshNotifications();
      } catch (error) {
        console.error("Error creating notification:", error);
      }
    },
    [user?.id, refreshNotifications]
  );

  // Utility methods for common notification types
  const notifyUpload = useCallback(
    (
      title: string,
      message: string,
      options?: { eventId?: string; uploadId?: string }
    ) => {
      return createNotification("upload", title, message, {
        metadata: options,
        shouldGroup: true,
      });
    },
    [createNotification]
  );

  const notifyModeration = useCallback(
    (
      title: string,
      message: string,
      options?: { eventId?: string; uploadId?: string }
    ) => {
      return createNotification("moderation", title, message, {
        metadata: options,
      });
    },
    [createNotification]
  );

  const notifySystem = useCallback(
    (title: string, message: string, actionUrl?: string) => {
      return createNotification("system", title, message, {
        actionUrl,
      });
    },
    [createNotification]
  );

  return {
    createNotification,
    notifyUpload,
    notifyModeration,
    notifySystem,
  };
};
