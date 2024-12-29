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
} from "@mui/material";
import {
  Person,
  AccountCircle,
  BarChart,
  CloudUpload,
  Mail,
  Notifications,
  Close,
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
  backgroundColor: "rgba(0, 0, 0, 0.95)",
  backdropFilter: "blur(10px)",
  borderRight: `1px solid ${theme.palette.divider}`,
  touchAction: "pan-y pinch-zoom",
}));

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { userAttributes } = useAuth();
  const isCreative = userAttributes?.userType === UserType.CREATIVE;
  const touchStartX = useRef<number | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
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
      drawer.addEventListener("touchstart", handleTouchStart);
      drawer.addEventListener("touchmove", handleTouchMove);
      drawer.addEventListener("touchend", handleTouchEnd);

      return () => {
        drawer.removeEventListener("touchstart", handleTouchStart);
        drawer.removeEventListener("touchmove", handleTouchMove);
        drawer.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, []);

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
        { text: "Account", icon: <AccountCircle />, path: "/account" },
        {
          text: "Notifications",
          icon: <Notifications />,
          path: "/notifications",
        },
      ];

  const userInitial = userAttributes?.name?.charAt(0) || "U";
  const userType = isCreative ? "creative" : "fan";

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        component: DrawerPaper,
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
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
          src={userAttributes?.picture || undefined}
        >
          {!userAttributes?.picture && userInitial}
        </UserAvatar>
        <Box>
          <Typography variant="subtitle1">
            {userAttributes?.name || "User"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isCreative ? "Creative" : "Fan"}
          </Typography>
        </Box>
      </UserProfile>

      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              onClose();
            }}
            sx={{
              py: 2,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};
