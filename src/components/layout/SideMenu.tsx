import React, { useRef, useEffect } from "react";
import {
  SwipeableDrawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Typography,
  styled,
  Avatar,
  Divider,
  ListItemButton,
  DrawerProps as MuiDrawerProps,
} from "@mui/material";
import {
  Person,
  AccountCircle,
  BarChart,
  CloudUpload,
  Mail,
  Notifications,
  Close,
  Logout as LogoutIcon,
  SwapHoriz,
  MusicNote,
  Event,
  Collections,
  Dashboard,
  VideoLibrary,
  Search,
  Favorite,
  Settings,
  Analytics,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { UserType } from "../../types/auth.types";

const UserAvatar = styled(Avatar)<{ usertype: "fan" | "creative" }>(
  ({ theme, usertype }) => ({
    width: 48,
    height: 48,
    marginRight: theme.spacing(2),
    backgroundColor:
      usertype === "creative"
        ? theme.palette.secondary.main
        : theme.palette.primary.main,
  })
);

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const UserProfile = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
  variant?: MuiDrawerProps["variant"];
}

export const SideMenu: React.FC<SideMenuProps> = ({
  open,
  onClose,
  variant = "temporary",
}) => {
  const navigate = useNavigate();
  const { userAttributes, signOut, switchUserType, isAuthenticated } =
    useAuth();
  const iOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (!isAuthenticated || !userAttributes) {
    return null;
  }

  const isCreative = userAttributes.userType === UserType.CREATIVE;

  const handleRoleSwitch = async () => {
    try {
      await switchUserType(isCreative ? UserType.FAN : UserType.CREATIVE);
      onClose();
    } catch (error) {
      console.error("Failed to switch role:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      onClose();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const menuItems = isCreative
    ? [
        { text: "Dashboard", icon: <Dashboard />, path: "/creative/dashboard" },
        {
          text: "Upload Videos",
          icon: <CloudUpload />,
          path: "/creative/videos/upload",
        },
        { text: "My Videos", icon: <VideoLibrary />, path: "/creative/videos" },
        { text: "Events", icon: <Event />, path: "/creative/events" },
        {
          text: "Memory Manager",
          icon: <Collections />,
          path: "/creative/memories",
        },
        {
          text: "My Profile",
          icon: <Person />,
          path: `/profile/${userAttributes?.id}`,
        },
        { text: "Analytics", icon: <Analytics />, path: "/creative/analytics" },
        { text: "Settings", icon: <Settings />, path: "/creative/settings" },
        {
          text: "Notifications",
          icon: <Notifications />,
          path: "/creative/notifications",
        },
      ]
    : [
        { text: "Dashboard", icon: <Dashboard />, path: "/fan/dashboard" },
        { text: "Discover", icon: <Search />, path: "/fan/search" },
        { text: "Events", icon: <Event />, path: "/fan/events" },
        {
          text: "My Playlists",
          icon: <VideoLibrary />,
          path: "/fan/playlists",
        },
        { text: "Following", icon: <Favorite />, path: "/fan/following" },
        { text: "Settings", icon: <Settings />, path: "/fan/settings" },
        {
          text: "Notifications",
          icon: <Notifications />,
          path: "/fan/notifications",
        },
      ];

  const footerItems = isCreative
    ? [
        {
          text: "Switch to Fan Account",
          icon: <SwapHoriz />,
          onClick: handleRoleSwitch,
        },
        { text: "Logout", icon: <LogoutIcon />, onClick: handleLogout },
      ]
    : [
        {
          text: "Become a Creative",
          icon: <MusicNote />,
          onClick: handleRoleSwitch,
        },
        { text: "Logout", icon: <LogoutIcon />, onClick: handleLogout },
      ];

  return (
    <SwipeableDrawer
      anchor="left"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableBackdropTransition={!iOS}
      disableDiscovery={iOS}
      sx={{
        "& .MuiDrawer-paper": {
          width: 280,
          zIndex: 1400,
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(0, 0, 0, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderRight: (theme) => `1px solid ${theme.palette.divider}`,
        },
        "& .MuiBackdrop-root": {
          zIndex: 1300,
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      }}
    >
      <DrawerHeader>
        <Typography variant="h6">Menu</Typography>
        <IconButton onClick={onClose} size="large">
          <Close />
        </IconButton>
      </DrawerHeader>

      <UserProfile>
        <UserAvatar
          usertype={isCreative ? "creative" : "fan"}
          src={userAttributes.avatarUrl || userAttributes.picture || undefined}
        >
          {!userAttributes.avatarUrl &&
            !userAttributes.picture &&
            userAttributes.displayName?.charAt(0).toUpperCase()}
        </UserAvatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {userAttributes.displayName || userAttributes.name || "User"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontSize: "0.75rem",
              fontWeight: 500,
            }}
          >
            {isCreative ? userAttributes.creativeType || "Creative" : "Fan"}
          </Typography>
        </Box>
      </UserProfile>

      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
            >
              <ListItemIcon sx={{ color: "text.secondary" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: "auto" }}>
        <Divider sx={{ my: 1 }} />
        <List>
          {footerItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={item.onClick}>
                <ListItemIcon sx={{ color: "text.secondary" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </SwipeableDrawer>
  );
};
