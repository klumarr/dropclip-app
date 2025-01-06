import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  notificationService,
  Notification,
} from "../services/notification.service";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated } = useAuth();

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      const fetchedNotifications = await notificationService.getNotifications(
        user.id
      );
      setNotifications(fetchedNotifications);
      const count = await notificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchNotifications();
      // Poll for new notifications every minute
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?.id]);

  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return;
    try {
      await notificationService.markAsRead(user.id, notificationId);
      await fetchNotifications(); // Refresh the notifications
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await notificationService.markAllAsRead(user.id);
      await fetchNotifications(); // Refresh the notifications
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const dismissNotification = async (notificationId: string) => {
    if (!user?.id) return;
    try {
      await notificationService.deleteNotification(user.id, notificationId);
      await fetchNotifications(); // Refresh the notifications
    } catch (error) {
      console.error("Error dismissing notification:", error);
    }
  };

  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
