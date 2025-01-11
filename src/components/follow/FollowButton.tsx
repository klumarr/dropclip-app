import React from "react";
import {
  Button,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import { useFollowStatus } from "../../hooks/useFollowStatus";

interface FollowButtonProps {
  creativeId: string;
  variant?: "icon" | "button";
  size?: "small" | "medium" | "large";
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  creativeId,
  variant = "button",
  size = "medium",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { isFollowing, isLoading, error, toggleFollow, clearError } =
    useFollowStatus(creativeId);

  const handleClick = async () => {
    await toggleFollow();
  };

  if (variant === "icon") {
    return (
      <>
        <IconButton
          onClick={handleClick}
          disabled={isLoading}
          size={size}
          color={isFollowing ? "primary" : "default"}
        >
          {isLoading ? <CircularProgress size={24} /> : <PersonIcon />}
        </IconButton>
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={clearError}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={clearError} severity="error">
            {error}
          </Alert>
        </Snackbar>
      </>
    );
  }

  return (
    <>
      <Button
        variant={isFollowing ? "outlined" : "contained"}
        onClick={handleClick}
        disabled={isLoading}
        size={size}
        startIcon={isLoading ? <CircularProgress size={20} /> : <PersonIcon />}
        sx={{
          minWidth: isMobile ? "auto" : undefined,
        }}
      >
        {isFollowing ? "Following" : "Follow"}
      </Button>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={clearError}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={clearError} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FollowButton;
