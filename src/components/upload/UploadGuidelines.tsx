import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import {
  CheckCircleOutline as CheckIcon,
  CloudUpload as UploadIcon,
  Warning as WarningIcon,
  Timer as TimerIcon,
  Movie as MovieIcon,
} from "@mui/icons-material";

interface UploadGuidelinesProps {
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  startTime?: string;
  endTime?: string;
  remainingUploads: number;
}

export const UploadGuidelines: React.FC<UploadGuidelinesProps> = ({
  maxFileSize = 100,
  allowedTypes = ["video/mp4", "video/quicktime"],
  startTime,
  endTime,
  remainingUploads,
}) => {
  const formatFileSize = (size: number) => {
    if (size >= 1024) {
      return `${(size / 1024).toFixed(1)} GB`;
    }
    return `${size} MB`;
  };

  const formatTimeRange = () => {
    if (!startTime && !endTime) return "No time restrictions";
    if (!startTime) return `Until ${endTime}`;
    if (!endTime) return `From ${startTime}`;
    return `${startTime} - ${endTime}`;
  };

  return (
    <Paper elevation={0} sx={{ p: 3, bgcolor: "background.default" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <UploadIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6">Upload Guidelines</Typography>
      </Box>

      <List>
        <ListItem>
          <ListItemIcon>
            <MovieIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="Supported Formats"
            secondary={allowedTypes.join(", ")}
          />
        </ListItem>

        <ListItem>
          <ListItemIcon>
            <WarningIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="Maximum File Size"
            secondary={formatFileSize(maxFileSize)}
          />
        </ListItem>

        <ListItem>
          <ListItemIcon>
            <TimerIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Upload Window" secondary={formatTimeRange()} />
        </ListItem>

        <ListItem>
          <ListItemIcon>
            <CheckIcon color="success" />
          </ListItemIcon>
          <ListItemText
            primary="Best Practices"
            secondary={
              <List dense>
                <ListItem>
                  <ListItemText secondary="Ensure good lighting and clear audio" />
                </ListItem>
                <ListItem>
                  <ListItemText secondary="Keep the camera steady" />
                </ListItem>
                <ListItem>
                  <ListItemText secondary="Film in landscape mode for better viewing" />
                </ListItem>
              </List>
            }
          />
        </ListItem>

        <ListItem>
          <ListItemIcon>
            <MovieIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="Remaining Uploads"
            secondary={`You have ${remainingUploads} upload${
              remainingUploads !== 1 ? "s" : ""
            } remaining`}
          />
        </ListItem>
      </List>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Note: All uploads will be reviewed for quality and content guidelines
        before being published.
      </Typography>
    </Paper>
  );
};
