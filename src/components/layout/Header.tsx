import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Box,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  styled,
  useTheme,
} from "@mui/material";
import { Notifications } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { UserType } from "../../types/auth.types";

const StyledAppBar = styled(AppBar)({
  backgroundColor: "rgba(0, 0, 0, 0.85)",
  backdropFilter: "blur(10px)",
  borderBottom: "none",
  boxShadow: "none",
});

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

const NotificationItem = styled(ListItem)({
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    cursor: "pointer",
  },
});

interface HeaderProps {
  onMenuOpen: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userAttributes, isAuthenticated } = useAuth();
  const [notificationsAnchor, setNotificationsAnchor] =
    useState<null | HTMLElement>(null);
  const isCreative = user?.userType === UserType.CREATIVE;
  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";
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

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case "/dashboard":
        return "Dashboard";
      case "/events":
        return "Events";
      case "/search":
        return "Search";
      case "/videos":
        return "Videos";
      case "/upload":
        return "Upload";
      default:
        return "DropClip";
    }
  };

  return (
    <StyledAppBar position="fixed">
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            ml: { xs: 1, sm: 2 },
          }}
        >
          {isAuthenticated ? (
            <>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={(e) => {
                  e.stopPropagation();
                  onMenuOpen();
                }}
                sx={{ p: 0 }}
              >
                <UserAvatar usertype={userType}>{userInitial}</UserAvatar>
              </IconButton>
              <Box>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ ml: isAuthenticated ? 0 : 0 }}
                >
                  {getPageTitle()}
                </Typography>
              </Box>
            </>
          ) : (
            <Typography
              variant="h6"
              component="div"
              sx={{ ml: isAuthenticated ? 2 : 0 }}
            >
              {getPageTitle()}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {isAuthenticated && (
            <IconButton
              color="inherit"
              onClick={handleNotificationsClick}
              size="large"
            >
              <Badge badgeContent={notifications.length} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          )}
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
              border: "1px solid rgba(255, 255, 255, 0.1)",
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
