import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Badge,
  useTheme,
} from "@mui/material";
import { Notifications } from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { UserType } from "../../types/auth.types";
import { useNotifications } from "../../contexts/NotificationContext";

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  console.log("👤 Header:", {
    user,
    screenWidth: window.innerWidth,
  });

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleProfileClick = () => {
    handleClose();
    navigate(
      user?.userType === UserType.CREATIVE
        ? "/creative/settings"
        : "/fan/settings"
    );
  };

  const handleNotificationsClick = () => {
    navigate("/notifications");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 1.5, sm: 3 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={onMenuClick}
            size="small"
            sx={{
              bgcolor: "action.selected",
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "primary.main",
                fontSize: "0.875rem",
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: "1.125rem", sm: "1.25rem" },
              fontWeight: 600,
              background: (theme) =>
                "linear-gradient(45deg, " +
                theme.palette.primary.main +
                ", " +
                theme.palette.secondary.main +
                ")",
              backgroundClip: "text",
              textFillColor: "transparent",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            DropClip
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            color="inherit"
            onClick={handleNotificationsClick}
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            sx={{
              "& .MuiPaper-root": {
                backgroundColor: "background.paper",
                borderRadius: 1,
                boxShadow: (theme) => theme.shadows[3],
                border: "1px solid",
                borderColor: "divider",
                mt: 1,
              },
            }}
          >
            <MenuItem
              onClick={handleProfileClick}
              sx={{
                fontSize: "0.875rem",
                py: 1,
                px: 2,
              }}
            >
              Profile
            </MenuItem>
            <MenuItem
              onClick={handleSignOut}
              sx={{
                fontSize: "0.875rem",
                py: 1,
                px: 2,
                color: "error.main",
              }}
            >
              Sign Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
