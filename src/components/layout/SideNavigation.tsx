import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Dashboard,
  VideoLibrary,
  Event,
  Analytics,
  Settings,
  Search,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { UserType } from "../../types/auth.types";

const DRAWER_WIDTH = 240;

interface SideNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SideNavigation = ({ isOpen, onClose }: SideNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  console.log("🎯 SideNavigation:", { user, pathname: location.pathname });

  const isCreative = user?.userType === UserType.CREATIVE;

  const creativeMenuItems = [
    {
      text: "Dashboard",
      icon: <Dashboard />,
      path: "/creative/dashboard",
    },
    {
      text: "Videos",
      icon: <VideoLibrary />,
      path: "/creative/videos",
    },
    {
      text: "Events",
      icon: <Event />,
      path: "/creative/events",
    },
    {
      text: "Analytics",
      icon: <Analytics />,
      path: "/creative/analytics",
    },
    {
      text: "Settings",
      icon: <Settings />,
      path: "/creative/settings",
    },
  ];

  const fanMenuItems = [
    {
      text: "Search",
      icon: <Search />,
      path: "/fan/search",
    },
    {
      text: "Events",
      icon: <Event />,
      path: "/fan/events",
    },
  ];

  const menuItems = isCreative ? creativeMenuItems : fanMenuItems;

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={isOpen}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          backgroundColor: "background.paper",
          borderRight: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      <Box sx={{ overflow: "auto", py: 2 }}>
        <List>
          {menuItems.map(({ text, icon, path }) => (
            <ListItem key={text} disablePadding>
              <ListItemButton
                selected={location.pathname === path}
                onClick={() => handleNavigation(path)}
                sx={{
                  py: 1.5,
                  px: 2,
                  "&.Mui-selected": {
                    backgroundColor: "action.selected",
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color:
                      location.pathname === path ? "primary.main" : "inherit",
                  }}
                >
                  {icon}
                </ListItemIcon>
                <ListItemText
                  primary={text}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: location.pathname === path ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};
