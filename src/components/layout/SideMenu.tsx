import React, { useRef, useEffect } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Typography,
  styled,
  useTheme,
  Avatar,
  Paper,
  Switch,
  Divider,
  ListItemSecondaryAction,
  ListItemButton,
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
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { UserType } from "../../types/auth.types";

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const UserProfile = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

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

const DrawerPaper = styled(Paper)(({ theme }) => ({
  width: 280,
  backgroundColor: (props: { usertype: "fan" | "creative" }) =>
    props.usertype === "fan" ? "rgba(25, 25, 25, 0.95)" : "rgba(0, 0, 0, 0.95)",
  backdropFilter: "blur(10px)",
  borderRight: `1px solid ${theme.palette.divider}`,
  touchAction: "none",
  zIndex: theme.zIndex.drawer + 1,
}));

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { userAttributes, signOut, switchUserType, isAuthenticated } =
    useAuth();
  const touchStartX = useRef<number | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchStartX.current) return;

    const currentX = e.touches[0].clientX;
    const diff = touchStartX.current - currentX;

    // If swiping left (diff > 0) and the distance is significant
    if (diff > 50) {
      touchStartX.current = null;
      onClose();
    }
  };

  const handleTouchEnd = () => {
    touchStartX.current = null;
  };

  useEffect(() => {
    const drawer = drawerRef.current;
    if (drawer) {
      drawer.addEventListener("touchstart", handleTouchStart as EventListener);
      drawer.addEventListener("touchmove", handleTouchMove as EventListener);
      drawer.addEventListener("touchend", handleTouchEnd);

      return () => {
        drawer.removeEventListener(
          "touchstart",
          handleTouchStart as EventListener
        );
        drawer.removeEventListener(
          "touchmove",
          handleTouchMove as EventListener
        );
        drawer.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, []);

  // Return early if not authenticated
  if (!isAuthenticated || !userAttributes) {
    return null;
  }

  const isCreative = userAttributes.userType === UserType.CREATIVE;
  const hasFanAccount = isCreative && userAttributes.linkedAccounts?.fan;
  const hasCreativeAccount =
    !isCreative &&
    (userAttributes.linkedAccounts?.creative ||
      userAttributes.isDormantCreative);

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
        { text: "Profile", icon: <Person />, path: "/profile" },
        { text: "Account", icon: <AccountCircle />, path: "/account" },
        { text: "Stats", icon: <BarChart />, path: "/stats" },
        { text: "Upload", icon: <CloudUpload />, path: "/upload" },
        { text: "Mailing List", icon: <Mail />, path: "/mailing-list" },
        {
          text: "Notifications",
          icon: <Notifications />,
          path: "/notifications",
        },
      ]
    : [
        { text: "Profile", icon: <Person />, path: "/profile" },
        { text: "My Content", icon: <CloudUpload />, path: "/my-content" },
        { text: "Events", icon: <Event />, path: "/events" },
        {
          text: "Notifications",
          icon: <Notifications />,
          path: "/notifications",
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

  const userInitial = userAttributes.name?.charAt(0) || "U";
  const userType = isCreative ? "creative" : "fan";

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        component: DrawerPaper,
        ref: drawerRef,
        usertype: userType,
      }}
      sx={{
        "& .MuiDrawer-paper": {
          zIndex: (theme) => theme.zIndex.drawer + 1,
        },
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <DrawerHeader>
        <Typography variant="h6">Menu</Typography>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </DrawerHeader>

      <UserProfile>
        <UserAvatar
          usertype={userType}
          src={userAttributes.picture || undefined}
        >
          {!userAttributes.picture &&
            userAttributes.name?.charAt(0).toUpperCase()}
        </UserAvatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {userAttributes.name || "User"}
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
            {isCreative ? "Creative" : "Fan"}
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
              <ListItemIcon>{item.icon}</ListItemIcon>
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
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};
