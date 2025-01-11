import React, { useEffect, useState } from "react";
import {
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import { notificationService } from "../../services/notification.service";
import {
  NotificationItem,
  NotificationType,
} from "../../types/notification.types";
import { getCurrentUser } from "@aws-amplify/auth";

export const NotificationTest: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserId(user.userId);
          await fetchNotifications(user.userId);
        }
      } catch (err) {
        console.error("Error initializing:", err);
        setError("Failed to initialize user");
      }
    };
    init();
  }, []);

  const fetchNotifications = async (uid: string) => {
    try {
      setLoading(true);
      const items = await notificationService.getNotifications(uid);
      setNotifications(items);
      setError(null);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotification = async () => {
    try {
      setLoading(true);
      await notificationService.createNotification({
        userId,
        type: NotificationType.SYSTEM,
        status: "unread",
        message: `Test notification created at ${new Date().toLocaleTimeString()}`,
        metadata: {
          testId: "test-" + Date.now(),
        },
      });
      await fetchNotifications(userId);
    } catch (err) {
      console.error("Error creating notification:", err);
      setError("Failed to create notification");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      setLoading(true);
      await notificationService.markAsRead(userId, notificationId);
      await fetchNotifications(userId);
    } catch (err) {
      console.error("Error marking as read:", err);
      setError("Failed to mark notification as read");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await notificationService.markAllAsRead(userId);
      await fetchNotifications(userId);
    } catch (err) {
      console.error("Error marking all as read:", err);
      setError("Failed to mark all notifications as read");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      setLoading(true);
      await notificationService.deleteNotification(userId, notificationId);
      await fetchNotifications(userId);
    } catch (err) {
      console.error("Error deleting notification:", err);
      setError("Failed to delete notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Notification Service Test
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          onClick={handleCreateNotification}
          disabled={loading || !userId}
          sx={{ mr: 1 }}
        >
          Create Test Notification
        </Button>
        <Button
          variant="outlined"
          onClick={handleMarkAllAsRead}
          disabled={loading || !userId}
        >
          Mark All as Read
        </Button>
      </Box>

      <List>
        {notifications.map((notification) => (
          <ListItem
            key={notification.id}
            divider
            secondaryAction={
              <Box>
                <Button
                  size="small"
                  onClick={() => handleMarkAsRead(notification.id)}
                  disabled={loading || notification.status === "read"}
                  sx={{ mr: 1 }}
                >
                  Mark Read
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDeleteNotification(notification.id)}
                  disabled={loading}
                >
                  Delete
                </Button>
              </Box>
            }
          >
            <ListItemText
              primary={notification.message}
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Chip label={notification.type} size="small" sx={{ mr: 1 }} />
                  <Chip
                    label={notification.status}
                    color={
                      notification.status === "unread" ? "primary" : "default"
                    }
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="caption" component="span">
                    {new Date(notification.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>

      {loading && (
        <Typography sx={{ mt: 2, textAlign: "center" }}>Loading...</Typography>
      )}
    </Box>
  );
};
