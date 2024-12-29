import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  styled,
} from "@mui/material";
import {
  Home,
  Search,
  VideoLibrary,
  Person,
  Event,
  CloudUpload,
  Dashboard,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

const StyledBottomNavigation = styled(BottomNavigation)(({ theme }) => ({
  backgroundColor: "rgba(0, 0, 0, 0.85)",
  backdropFilter: "blur(10px)",
  borderTop: `1px solid ${theme.palette.divider}`,
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: theme.zIndex.appBar,
  height: 60,
  "& .MuiBottomNavigationAction-root": {
    color: theme.palette.text.secondary,
    minWidth: "auto",
    padding: "6px 0",
    "&.Mui-selected": {
      color: theme.palette.primary.main,
    },
    "& .MuiBottomNavigationAction-label": {
      fontSize: "0.625rem",
    },
  },
}));

export const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(0);
  const { user, userAttributes } = useAuth();
  const isCreative = userAttributes?.userType === "CREATOR";

  const navigationItems = isCreative
    ? [
        { label: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
        { label: "Events", icon: <Event />, path: "/events" },
        { label: "Playlists", icon: <VideoLibrary />, path: "/playlists" },
        { label: "Videos", icon: <VideoLibrary />, path: "/videos" },
      ]
    : [
        { label: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
        { label: "Search", icon: <Search />, path: "/search" },
        { label: "Playlists", icon: <VideoLibrary />, path: "/playlists" },
        { label: "Upload", icon: <CloudUpload />, path: "/upload" },
      ];

  useEffect(() => {
    const currentIndex = navigationItems.findIndex(
      (item) => item.path === location.pathname
    );
    if (currentIndex !== -1) setValue(currentIndex);
  }, [location, navigationItems]);

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <StyledBottomNavigation
        value={value}
        onChange={(_, newValue) => {
          setValue(newValue);
          navigate(navigationItems[newValue].path);
        }}
        showLabels
      >
        {navigationItems.map((item) => (
          <BottomNavigationAction
            key={item.label}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </StyledBottomNavigation>
    </Paper>
  );
};
