import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Share as ShareIcon,
  Delete as DeleteIcon,
  QrCode as QrCodeIcon,
} from "@mui/icons-material";
import { useEventActions } from "../../../../hooks/useEventActions";
import { ErrorBoundary } from "../../../common/ErrorBoundary";
import { LoadingState } from "../../../common/LoadingState";
import ShareMenu from "./ShareMenu";
import DeleteDialog from "./DeleteDialog";
import QRDialog from "./QRDialog";
import { EventActionsProps, SharePlatform } from "./types";
import { Event } from "../../../../types/events";

const EventActions: React.FC<EventActionsProps> = ({ className }) => {
  const {
    selectedEvent,
    isLoading,
    error,
    handleInitiateDelete,
    handleConfirmDelete,
    handleShare,
  } = useEventActions();

  const [shareAnchorEl, setShareAnchorEl] = useState<null | HTMLElement>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleShareClick = (event: React.MouseEvent<HTMLElement>) => {
    setShareAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
  };

  const handleShareWrapper = async (event: Event, platform: SharePlatform) => {
    try {
      await handleShare(event, platform);
      if (platform === "copy") {
        setCopySuccess(true);
      }
      handleShareClose();
    } catch (err) {
      console.error("Error sharing event:", err);
      setShareError(
        platform === "copy"
          ? "Failed to copy URL to clipboard"
          : "Failed to share event"
      );
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    setIsDeleting(true);
    try {
      await handleConfirmDelete();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading..." />;
  }

  return (
    <ErrorBoundary>
      <Box
        className={className}
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <Tooltip title="Share Event">
          <IconButton
            onClick={handleShareClick}
            disabled={!selectedEvent}
            color="primary"
          >
            <ShareIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Generate QR Code">
          <IconButton
            onClick={() => setIsQRDialogOpen(true)}
            disabled={!selectedEvent}
            color="primary"
          >
            <QrCodeIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete Event">
          <IconButton
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={!selectedEvent}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <ShareMenu
        event={selectedEvent}
        open={Boolean(shareAnchorEl)}
        anchorEl={shareAnchorEl}
        onClose={handleShareClose}
        onShare={handleShareWrapper}
      />

      <DeleteDialog
        event={selectedEvent}
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />

      <QRDialog
        event={selectedEvent}
        open={isQRDialogOpen}
        onClose={() => setIsQRDialogOpen(false)}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setShareError(null)}
      >
        <Alert severity="error" onClose={() => setShareError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!shareError}
        autoHideDuration={6000}
        onClose={() => setShareError(null)}
      >
        <Alert severity="error" onClose={() => setShareError(null)}>
          {shareError}
        </Alert>
      </Snackbar>

      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
      >
        <Alert severity="success" onClose={() => setCopySuccess(false)}>
          Event URL copied to clipboard
        </Alert>
      </Snackbar>
    </ErrorBoundary>
  );
};

export default EventActions;
