import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { DeleteDialogProps } from "./types";

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  event,
  open,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!event) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete Event</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete the event "{event.title}"? This action
          cannot be undone.
        </Typography>
        {event.isAutomatic && (
          <Typography color="error" sx={{ mt: 2 }}>
            Warning: This is an automatic event. Deleting it will remove all
            associated fan uploads.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={isDeleting}
          startIcon={
            isDeleting ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
