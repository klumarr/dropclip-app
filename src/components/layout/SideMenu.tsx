import React from "react";
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
} from "@mui/material";
import {
  Person,
  AccountCircle,
  BarChart,
  CloudUpload,
  Mail,
  Notifications,
  Settings,
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

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { userAttributes } = useAuth();
  const isCreative = userAttributes?.userType === UserType.CREATIVE;

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
        {
          text: "Settings & Privacy",
          icon: <Settings />,
          path: "/settings",
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
        {
          text: "Settings & Privacy",
          icon: <Settings />,
          path: "/settings",
        },
      ];

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 280,
          backgroundColor: "rgba(0, 0, 0, 0.95)",
          backdropFilter: "blur(10px)",
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <DrawerHeader>
        <Typography variant="h6">Menu</Typography>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </DrawerHeader>
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
