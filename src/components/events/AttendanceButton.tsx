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
import { Event as EventIcon } from "@mui/icons-material";
import { useAttendanceStatus } from "../../hooks/useAttendanceStatus";

interface AttendanceButtonProps {
  eventId: string;
  variant?: "icon" | "button";
  size?: "small" | "medium" | "large";
}

export const AttendanceButton: React.FC<AttendanceButtonProps> = ({
  eventId,
  variant = "button",
  size = "medium",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { isAttending, isLoading, error, toggleAttendance, clearError } =
    useAttendanceStatus(eventId);

  const handleClick = async () => {
    await toggleAttendance();
  };

  if (variant === "icon") {
    return (
      <>
        <IconButton
          onClick={handleClick}
          disabled={isLoading}
          size={size}
          color={isAttending ? "primary" : "default"}
        >
          {isLoading ? <CircularProgress size={24} /> : <EventIcon />}
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
        variant={isAttending ? "outlined" : "contained"}
        onClick={handleClick}
        disabled={isLoading}
        size={size}
        startIcon={isLoading ? <CircularProgress size={20} /> : <EventIcon />}
        sx={{
          minWidth: isMobile ? "auto" : undefined,
        }}
      >
        {isAttending ? "Attending" : "Attend"}
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

export default AttendanceButton;
