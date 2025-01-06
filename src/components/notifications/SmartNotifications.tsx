import React, { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  IconButton,
  Badge,
  Menu,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormGroup,
  FormControlLabel,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Event as EventIcon,
  VideoLibrary as VideoIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useNotifications } from "../../contexts/NotificationContext";
import { Notification } from "../../services/notification.service";

interface NotificationPreferences {
  events: boolean;
  videos: boolean;
  social: boolean;
  system: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export const SmartNotifications: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    events: true,
    videos: true,
    social: true,
    system: true,
    emailNotifications: true,
    pushNotifications: true,
  });

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  } = useNotifications();

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "upload":
        return <VideoIcon />;
      case "moderation":
        return <EventIcon />;
      case "system":
        return <NotificationsIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.status === "unread") {
      await markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    setAnchorEl(null);
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(newPreferences);
    // TODO: Implement preference update in backend
  };

  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  return (
    <>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        size="large"
        sx={{ mr: 2 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: { width: 360, maxHeight: 500 },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">Notifications</Typography>
          <Box>
            <IconButton size="small" onClick={() => setSettingsOpen(true)}>
              <SettingsIcon />
            </IconButton>
            {unreadCount > 0 && (
              <Button
                size="small"
                onClick={() => markAllAsRead()}
                sx={{ ml: 1 }}
              >
                Mark all as read
              </Button>
            )}
          </Box>
        </Box>

        <Divider />

        <List sx={{ p: 0 }}>
          {Object.entries(groupedNotifications).map(([date, notifications]) => (
            <React.Fragment key={date}>
              <ListItem sx={{ bgcolor: "action.hover" }}>
                <Typography variant="caption" color="text.secondary">
                  {date}
                </Typography>
              </ListItem>
              {notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    bgcolor:
                      notification.status === "read"
                        ? "transparent"
                        : "action.hover",
                  }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissNotification(notification.id);
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar>{getNotificationIcon(notification.type)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.title}
                    secondary={notification.message}
                    secondaryTypographyProps={{
                      sx: {
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      },
                    }}
                  />
                </ListItem>
              ))}
            </React.Fragment>
          ))}
          {notifications.length === 0 && (
            <ListItem>
              <ListItemText
                primary="No notifications"
                secondary="You're all caught up!"
                sx={{ textAlign: "center" }}
              />
            </ListItem>
          )}
        </List>
      </Menu>

      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Notification Settings</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Notification Types
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.events}
                  onChange={() => handlePreferenceChange("events")}
                />
              }
              label="Event Updates"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.videos}
                  onChange={() => handlePreferenceChange("videos")}
                />
              }
              label="Video Uploads"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.social}
                  onChange={() => handlePreferenceChange("social")}
                />
              }
              label="Social Interactions"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.system}
                  onChange={() => handlePreferenceChange("system")}
                />
              }
              label="System Updates"
            />
          </FormGroup>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
            Delivery Preferences
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.emailNotifications}
                  onChange={() => handlePreferenceChange("emailNotifications")}
                />
              }
              label="Email Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.pushNotifications}
                  onChange={() => handlePreferenceChange("pushNotifications")}
                />
              }
              label="Push Notifications"
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
