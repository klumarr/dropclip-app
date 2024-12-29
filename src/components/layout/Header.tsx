import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Box,
  Menu,
  MenuItem,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  styled,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications,
  AccountCircle,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { UserType } from "../../types/auth.types";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: "rgba(0, 0, 0, 0.85)",
  backdropFilter: "blur(10px)",
  borderBottom: "none",
  boxShadow: "none",
}));

const UserAvatar = styled(Avatar)<{ usertype: "fan" | "creative" }>(
  ({ theme, usertype }) => ({
    width: 32,
    height: 32,
    backgroundColor:
      usertype === "creative"
        ? theme.palette.secondary.main
        : theme.palette.primary.main,
  })
);

const NotificationItem = styled(ListItem)(({ theme }) => ({
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    cursor: "pointer",
  },
}));

interface HeaderProps {
  onMenuOpen: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuOpen }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, userAttributes, signOut } = useAuth();
  const [notificationsAnchor, setNotificationsAnchor] =
    useState<null | HTMLElement>(null);
  const isCreative = userAttributes?.userType === UserType.CREATIVE;
  const userInitial = userAttributes?.name?.charAt(0) || "U";
  const userType = isCreative ? "creative" : "fan";

  // Mock notifications - replace with real data
  const notifications = [
    {
      id: 1,
      title: "New Upload",
      message: "Creator XYZ just uploaded a new video",
      avatar: "https://example.com/avatar1.jpg",
      time: "2 minutes ago",
    },
    {
      id: 2,
      title: "Event Starting Soon",
      message: "Your scheduled event starts in 30 minutes",
      avatar: "https://example.com/avatar2.jpg",
      time: "30 minutes ago",
    },
  ];

  const handleNotificationsClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <StyledAppBar position="fixed">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuOpen}
            sx={{ p: 0 }}
          >
            <UserAvatar
              usertype={userType}
              src={userAttributes?.picture || undefined}
            >
              {!userAttributes?.picture && userInitial}
            </UserAvatar>
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            color="inherit"
            onClick={handleNotificationsClick}
            size="large"
          >
            <Badge badgeContent={notifications.length} color="error">
              <Notifications />
            </Badge>
          </IconButton>
        </Box>

        <Popover
          open={Boolean(notificationsAnchor)}
          anchorEl={notificationsAnchor}
          onClose={handleNotificationsClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            sx: {
              width: 320,
              maxHeight: 400,
              backgroundColor: "rgba(0, 0, 0, 0.95)",
              backdropFilter: "blur(10px)",
              border: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          <List>
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar src={notification.avatar} />
                </ListItemAvatar>
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {notification.message}
                      </Typography>
                      <br />
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                      >
                        {notification.time}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </NotificationItem>
            ))}
          </List>
        </Popover>
      </Toolbar>
    </StyledAppBar>
  );
};
