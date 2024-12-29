import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  styled,
} from "@mui/material";
import {
  Search,
  VideoLibrary,
  Event,
  CloudUpload,
  Dashboard,
  Person,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { UserType } from "../../types/auth.types";

const StyledBottomNavigation = styled(BottomNavigation)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
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
  const { userAttributes } = useAuth();
  const isCreative = userAttributes?.userType === UserType.CREATIVE;

  const navigationItems = isCreative
    ? [
        { label: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
        { label: "Events", icon: <Event />, path: "/events" },
        { label: "Search", icon: <Search />, path: "/search" },
        { label: "Videos", icon: <VideoLibrary />, path: "/videos" },
        { label: "Profile", icon: <Person />, path: "/profile" },
      ]
    : [
        { label: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
        { label: "Search", icon: <Search />, path: "/search" },
        { label: "Events", icon: <Event />, path: "/events" },
        { label: "Upload", icon: <CloudUpload />, path: "/upload" },
        { label: "Profile", icon: <Person />, path: "/profile" },
      ];

  useEffect(() => {
    const currentIndex = navigationItems.findIndex(
      (item) => item.path === location.pathname
    );
    if (currentIndex !== -1) setValue(currentIndex);
  }, [location, navigationItems]);

  const handleNavigation = (newValue: number) => {
    setValue(newValue);
    const path = navigationItems[newValue].path;
    console.log(`Navigating to: ${path}`);
    navigate(path);
  };

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
        onChange={(_, newValue) => handleNavigation(newValue)}
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
