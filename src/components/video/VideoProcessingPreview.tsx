import React from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  Alert,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayIcon,
} from "@mui/icons-material";
import { useVideoProcessing } from "../../hooks/useVideoProcessing";

interface VideoProcessingPreviewProps {
  uploadId: string;
  eventId: string;
  onProcessingComplete?: () => void;
}

export const VideoProcessingPreview: React.FC<VideoProcessingPreviewProps> = ({
  uploadId,
  eventId,
  onProcessingComplete,
}) => {
  const { state, previewUrl, actions } = useVideoProcessing(uploadId, eventId);

  // Call onProcessingComplete when processing is done
  React.useEffect(() => {
    if (state.status === "completed" && onProcessingComplete) {
      onProcessingComplete();
    }
  }, [state.status, onProcessingComplete]);

  const renderPreview = () => {
    if (previewUrl) {
      return (
        <Card sx={{ maxWidth: 345, mb: 2 }}>
          <CardMedia
            component="video"
            height="140"
            src={previewUrl}
            title="Video preview"
            controls
          />
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Processing completed successfully
            </Typography>
            {state.metadata && (
              <Box mt={1}>
                <Typography variant="caption" display="block">
                  Duration: {state.metadata.duration}s
                </Typography>
                <Typography variant="caption" display="block">
                  Resolution: {state.metadata.width}x{state.metadata.height}
                </Typography>
                <Typography variant="caption" display="block">
                  Format: {state.metadata.codec}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      );
    }

    if (state.thumbnails && state.thumbnails.length > 0) {
      return (
        <Card sx={{ maxWidth: 345, mb: 2 }}>
          <CardMedia
            component="img"
            height="140"
            image={state.thumbnails[0]}
            alt="Video thumbnail"
          />
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Processing in progress...
            </Typography>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  const renderStatus = () => {
    switch (state.status) {
      case "idle":
        return (
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              variant="contained"
              startIcon={<PlayIcon />}
              onClick={actions.startProcessing}
            >
              Start Processing
            </Button>
          </Box>
        );

      case "processing":
        return (
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress
              variant="determinate"
              value={state.progress}
              size={24}
            />
            <Typography>Processing: {state.progress}%</Typography>
            <Tooltip title="Cancel Processing">
              <IconButton
                color="error"
                size="small"
                onClick={actions.cancelProcessing}
              >
                <CancelIcon />
              </IconButton>
            </Tooltip>
          </Box>
        );

      case "completed":
        return (
          <Alert severity="success">
            Video processing completed successfully
          </Alert>
        );

      case "failed":
        return (
          <Box>
            <Alert severity="error" sx={{ mb: 2 }}>
              {state.error || "Processing failed"}
            </Alert>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={actions.retryProcessing}
            >
              Retry Processing
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      {renderPreview()}
      {renderStatus()}
    </Box>
  );
};
