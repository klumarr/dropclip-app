import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Alert,
  IconButton,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Cancel as CancelIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { useDownload } from "../../hooks/useDownload";

interface VideoDownloadProps {
  uploadId: string;
  eventId: string;
  availableQualities?: Array<{
    quality: string;
    label: string;
  }>;
  onDownloadComplete?: () => void;
}

export const VideoDownload: React.FC<VideoDownloadProps> = ({
  uploadId,
  eventId,
  availableQualities = [
    { quality: "original", label: "Original Quality" },
    { quality: "1080p", label: "1080p HD" },
    { quality: "720p", label: "720p HD" },
    { quality: "480p", label: "480p SD" },
  ],
  onDownloadComplete,
}) => {
  const [selectedQuality, setSelectedQuality] = useState(
    availableQualities[0].quality
  );
  const { state, actions } = useDownload(uploadId, eventId);

  const handleDownload = async () => {
    await actions.startDownload({
      quality: selectedQuality,
      forceDownload: true,
      onSuccess: () => {
        onDownloadComplete?.();
      },
    });
  };

  const renderDownloadButton = () => {
    switch (state.status) {
      case "idle":
        return (
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            fullWidth
          >
            Download Video
          </Button>
        );

      case "preparing":
        return (
          <Button variant="contained" disabled fullWidth>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            Preparing Download...
          </Button>
        );

      case "downloading":
        return (
          <Box sx={{ width: "100%" }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={1}
            >
              <Typography variant="body2">
                Downloading:{" "}
                {Math.round(
                  (state.progress.downloaded / state.progress.total) * 100
                )}
                %
              </Typography>
              <Tooltip title="Cancel Download">
                <IconButton
                  size="small"
                  onClick={actions.cancelDownload}
                  color="error"
                >
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(state.progress.downloaded / state.progress.total) * 100}
            />
          </Box>
        );

      case "completed":
        return (
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckIcon />}
            fullWidth
            disabled
          >
            Download Complete
          </Button>
        );

      case "failed":
        return (
          <Box sx={{ width: "100%" }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {state.error || "Download failed"}
            </Alert>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              fullWidth
            >
              Retry Download
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="quality-select-label">Quality</InputLabel>
        <Select
          labelId="quality-select-label"
          value={selectedQuality}
          label="Quality"
          onChange={(e) => setSelectedQuality(e.target.value)}
          disabled={state.status !== "idle" && state.status !== "failed"}
        >
          {availableQualities.map((quality) => (
            <MenuItem key={quality.quality} value={quality.quality}>
              {quality.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {renderDownloadButton()}
    </Box>
  );
};
