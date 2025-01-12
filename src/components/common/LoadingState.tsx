import React from "react";
import {
  Box,
  CircularProgress,
  Typography,
  LinearProgress,
  Paper,
  useTheme,
} from "@mui/material";

export interface LoadingStateProps {
  message?: string;
  type?: "circular" | "linear";
  progress?: number;
  fullscreen?: boolean;
  overlay?: boolean;
  size?: "small" | "medium" | "large";
  variant?: "default" | "transparent" | "contained";
}

const SIZES = {
  small: 24,
  medium: 40,
  large: 56,
};

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  type = "circular",
  progress,
  fullscreen = false,
  overlay = false,
  size = "medium",
  variant = "default",
}) => {
  const theme = useTheme();

  const content = (
    <>
      {type === "circular" ? (
        <CircularProgress
          variant={progress !== undefined ? "determinate" : "indeterminate"}
          value={progress}
          size={SIZES[size]}
          sx={{ mb: 2 }}
        />
      ) : (
        <Box sx={{ width: "100%", maxWidth: 400, mb: 2 }}>
          <LinearProgress
            variant={progress !== undefined ? "determinate" : "indeterminate"}
            value={progress}
          />
        </Box>
      )}
      {message && (
        <Typography
          variant={size === "small" ? "body2" : "body1"}
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          {message}
        </Typography>
      )}
      {progress !== undefined && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, textAlign: "center" }}
        >
          {Math.round(progress)}%
        </Typography>
      )}
    </>
  );

  const containerStyles = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    ...(variant === "contained" && {
      p: 3,
      bgcolor: "background.paper",
      borderRadius: 1,
      boxShadow: 1,
    }),
    ...(variant === "transparent" && {
      p: 3,
      bgcolor: "transparent",
    }),
    ...(fullscreen && {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: theme.zIndex.modal,
      bgcolor: overlay ? "rgba(0, 0, 0, 0.5)" : "background.paper",
    }),
    ...(overlay &&
      !fullscreen && {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: "rgba(255, 255, 255, 0.8)",
        zIndex: theme.zIndex.modal - 1,
      }),
  };

  const wrappedContent =
    variant === "contained" ? (
      <Paper elevation={1} sx={{ p: 3, minWidth: 200 }}>
        {content}
      </Paper>
    ) : (
      content
    );

  return (
    <Box
      sx={containerStyles}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      {wrappedContent}
    </Box>
  );
};
