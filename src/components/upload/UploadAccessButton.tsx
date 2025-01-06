import React from "react";
import {
  Button,
  CircularProgress,
  Tooltip,
  Typography,
  Box,
  useTheme,
} from "@mui/material";
import { CloudUpload as UploadIcon } from "@mui/icons-material";
import { useUploadAccess } from "../../hooks/useUploadAccess";
import { useNavigate } from "react-router-dom";

interface UploadAccessButtonProps {
  eventId: string;
  creativeId: string;
}

export const UploadAccessButton: React.FC<UploadAccessButtonProps> = ({
  eventId,
  creativeId,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { hasAccess, isLoading, error, uploadLink, remainingUploads } =
    useUploadAccess(eventId, creativeId);

  const handleClick = () => {
    if (hasAccess && uploadLink) {
      navigate(`/events/${eventId}/upload/${uploadLink}`);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <CircularProgress size={24} />
        <Typography variant="body2" color="text.secondary">
          Checking upload access...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Tooltip title={error}>
        <Box>
          <Button
            variant="outlined"
            color="error"
            startIcon={<UploadIcon />}
            disabled
          >
            Upload Access Unavailable
          </Button>
        </Box>
      </Tooltip>
    );
  }

  if (!hasAccess) {
    return (
      <Tooltip title="Follow the creative and mark attendance to get upload access">
        <Box>
          <Button variant="outlined" startIcon={<UploadIcon />} disabled>
            Upload Access Locked
          </Button>
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box>
      <Button
        variant="contained"
        color="primary"
        startIcon={<UploadIcon />}
        onClick={handleClick}
        sx={{
          backgroundColor: theme.palette.primary.main,
          "&:hover": {
            backgroundColor: theme.palette.primary.dark,
          },
        }}
      >
        Upload Videos ({remainingUploads} remaining)
      </Button>
    </Box>
  );
};

export default UploadAccessButton;
