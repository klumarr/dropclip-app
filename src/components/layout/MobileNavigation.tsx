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
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { UserType } from "../../types/auth.types";

const StyledBottomNavigation = styled(BottomNavigation)(({ theme }) => ({
  backgroundColor: "transparent",
  backdropFilter: "blur(10px)",
  borderTop: "none",
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: theme.zIndex.appBar,
  height: 60,
  "& .MuiBottomNavigationAction-root": {
    color: "rgba(255, 255, 255, 0.9)",
    minWidth: "auto",
    padding: "6px 0",
    "&.Mui-selected": {
      color: theme.palette.primary.main,
    },
    "& .MuiBottomNavigationAction-label": {
      fontSize: "0.625rem",
      fontWeight: 600,
      textShadow: "0 2px 4px rgba(0,0,0,0.9)",
    },
    "& .MuiSvgIcon-root": {
      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.9))",
    },
  },
}));

export const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(0);
  const { userAttributes } = useAuth();
  const isCreative = userAttributes?.userType === UserType.CREATIVE;

  const navigationItems = useMemo(
    () =>
      isCreative
        ? [
            { label: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
            { label: "Events", icon: <Event />, path: "/events" },
            { label: "Search", icon: <Search />, path: "/search" },
            { label: "Videos", icon: <VideoLibrary />, path: "/videos" },
          ]
        : [
            { label: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
            { label: "Search", icon: <Search />, path: "/search" },
            { label: "Events", icon: <Event />, path: "/events" },
            { label: "Upload", icon: <CloudUpload />, path: "/upload" },
          ],
    [isCreative]
  );

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
        opacity: 0.95,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
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
