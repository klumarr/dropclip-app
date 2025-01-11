import React from "react";
import {
  Box,
  CircularProgress,
  Typography,
  LinearProgress,
} from "@mui/material";

interface LoadingStateProps {
  message?: string;
  type?: "circular" | "linear";
  progress?: number;
  fullscreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  type = "circular",
  progress,
  fullscreen = false,
}) => {
  const content = (
    <>
      {type === "circular" ? (
        <CircularProgress
          variant={progress !== undefined ? "determinate" : "indeterminate"}
          value={progress}
          size={40}
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
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
      {progress !== undefined && (
        <Typography variant="body2" color="text.secondary">
          {Math.round(progress)}%
        </Typography>
      )}
    </>
  );

  if (fullscreen) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.paper",
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        minHeight: 200,
      }}
    >
      {content}
    </Box>
  );
};
