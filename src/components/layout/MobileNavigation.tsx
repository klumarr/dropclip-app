import { useEffect, useState } from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useTheme,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getAuthorizedNavItems } from "../../config/navigation.config";

const MobileNavigation = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { userAttributes } = useAuth();
  const [value, setValue] = useState(0);

  const navItems = getAuthorizedNavItems(userAttributes?.userType, "mobileNav");

  useEffect(() => {
    const currentIndex = navItems.findIndex(
      (item) => location.pathname === item.path
    );
    if (currentIndex !== -1) {
      setValue(currentIndex);
    }
  }, [location.pathname, navItems]);

  // Update system navigation bar color
  useEffect(() => {
    const metaThemeColor = document.querySelector(
      'meta[name="theme-color"]'
    ) as HTMLMetaElement;
    if (!metaThemeColor) {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = "transparent";
      document.head.appendChild(meta);
    } else {
      metaThemeColor.content = "transparent";
    }
  }, []);

  const handleNavigation = (newValue: number) => {
    setValue(newValue);
    navigate(navItems[newValue].path);
  };

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar,
        background:
          "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.4) 15%, rgba(0, 0, 0, 0.7) 40%, rgba(0, 0, 0, 0.85))",
        backdropFilter: "none",
        border: "none",
        paddingTop: "32px",
        marginTop: "-32px",
      }}
      elevation={0}
    >
      <BottomNavigation
        value={value}
        onChange={(_, newValue) => handleNavigation(newValue)}
        showLabels
        sx={{
          background: "transparent",
          height: 64,
          "& .MuiBottomNavigationAction-root": {
            color: "rgba(255, 255, 255, 0.8)",
            "&.Mui-selected": {
              color: theme.palette.primary.main,
            },
            "& .MuiBottomNavigationAction-label": {
              fontSize: "0.75rem",
              fontWeight: 500,
              "&.Mui-selected": {
                fontSize: "0.75rem",
              },
            },
            "& .MuiSvgIcon-root": {
              fontSize: "1.5rem",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
              transition: "transform 0.2s ease-in-out",
            },
            "&:hover .MuiSvgIcon-root": {
              transform: "scale(1.1)",
            },
            "&.Mui-selected .MuiSvgIcon-root": {
              transform: "scale(1.2)",
            },
          },
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.id}
            label={item.label}
            icon={<item.icon />}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};
export default MobileNavigation;
