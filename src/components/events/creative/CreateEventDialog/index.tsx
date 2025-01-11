import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { CreateEventForm } from "./CreateEventForm";
import { useEvents } from "../../../../contexts/EventsContext";
import { useAuth } from "../../../../contexts/AuthContext";
import { EventFormData } from "../../../../types/events";

interface CreateEventDialogProps {
  open: boolean;
  onClose: () => void;
}

export const CreateEventDialog: React.FC<CreateEventDialogProps> = ({
  open,
  onClose,
}) => {
  const { setNewEvent, createEvent } = useEvents();
  const { user } = useAuth();
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    ticketLink: "",
    imageUrl: "",
    uploadConfig: {
      enabled: true,
      allowedTypes: ["video/mp4"],
      maxFileSize: 500,
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<{ message: string } | undefined>();

  const handleClose = () => {
    setNewEvent(null);
    onClose();
  };

  const handleChange = (field: keyof EventFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (data: EventFormData) => {
    if (!user?.id) {
      setFormError({ message: "User must be authenticated to create events" });
      return;
    }

    try {
      await createEvent(user.id, data);
      handleClose();
    } catch (error) {
      setFormError({
        message:
          error instanceof Error ? error.message : "Failed to create event",
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: "background.paper",
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: "flex", alignItems: "center" }}>
        Create New Event
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ p: 1 }}>
          <CreateEventForm
            formData={formData}
            onChange={handleChange}
            errors={errors}
            onSubmit={handleSubmit}
            formError={formError}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
