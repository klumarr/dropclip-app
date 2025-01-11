import { useCallback, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { notificationService } from "../services/notification.service";
import {
  NotificationType,
  NotificationItem,
  NotificationStatus,
  CreateNotificationParams,
} from "../types/notification.types";
import { UploadStatus } from "../types/uploads";

export const useNotificationManager = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const createNotification = useCallback(
    async (params: Omit<CreateNotificationParams, "userId">) => {
      if (!user?.id) return;

      try {
        const notification = await notificationService.createNotification({
          ...params,
          userId: user.id,
        });
        setNotifications((prev) => [...prev, notification]);
        if (notification.status === "unread") {
          setUnreadCount((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Failed to create notification:", error);
      }
    },
    [user?.id]
  );

  const notifyModeration = useCallback(
    async (
      uploadId: string,
      status: UploadStatus.APPROVED | UploadStatus.REJECTED,
      message?: string
    ) => {
      await createNotification({
        type:
          status === UploadStatus.APPROVED
            ? NotificationType.CONTENT_APPROVED
            : NotificationType.CONTENT_REJECTED,
        status: "unread",
        message: message || `Upload ${uploadId} has been ${status}`,
        metadata: {
          uploadId,
          status,
        },
      });
    },
    [createNotification]
  );

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const fetchedNotifications = await notificationService.getNotifications(
        user.id
      );
      setNotifications(fetchedNotifications);
      setUnreadCount(
        fetchedNotifications.filter((n) => n.status === "unread").length
      );
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [user?.id]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!user?.id) return;

      try {
        await notificationService.markAsRead(user.id, notificationId);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, status: "read" } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    },
    [user?.id]
  );

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }, [user?.id]);

  const dismissNotification = useCallback(
    async (notificationId: string) => {
      if (!user?.id) return;

      try {
        await notificationService.deleteNotification(user.id, notificationId);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        setUnreadCount((prev) =>
          notifications.find((n) => n.id === notificationId)?.status ===
          "unread"
            ? Math.max(0, prev - 1)
            : prev
        );
      } catch (error) {
        console.error("Failed to dismiss notification:", error);
      }
    },
    [user?.id, notifications]
  );

  return {
    notifications,
    unreadCount,
    createNotification,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    notifyModeration,
  };
};
