import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { notificationService } from "../services/notification.service";
import { NotificationItem } from "../types/notification.types";

interface NotificationContextType {
  notifications: NotificationItem[];
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
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated, isLoading } = useAuth();

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
    // Only fetch notifications if auth is ready and user is authenticated
    if (!isLoading && isAuthenticated && user?.id) {
      console.log("Setting up notifications for authenticated user:", user.id);
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
    // If not authenticated or still loading, reset notifications
    if (!isLoading && !isAuthenticated) {
      console.log("Resetting notifications - user not authenticated");
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isLoading, isAuthenticated, user?.id]);

  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return;
    try {
      await notificationService.markAsRead(user.id, notificationId);
      await fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await notificationService.markAllAsRead(user.id);
      await fetchNotifications();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const dismissNotification = async (notificationId: string) => {
    if (!user?.id) return;
    try {
      await notificationService.deleteNotification(user.id, notificationId);
      await fetchNotifications();
    } catch (error) {
      console.error("Error dismissing notification:", error);
    }
  };

  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  // Always render the provider with current state
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
