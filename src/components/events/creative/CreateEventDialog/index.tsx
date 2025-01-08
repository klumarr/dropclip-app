import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Tabs,
  Tab,
  Typography,
} from "@mui/material";
import { useEvents } from "../../../../contexts/EventsContext";
import { useEventForm } from "../../../../hooks/useEventForm";
import { defaultUploadConfig } from "../../../../types/events";
import CreateEventForm from "./CreateEventForm";
import UploadConfigForm from "./UploadConfigForm";
import { TabPanelProps } from "./types";

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && children}
  </div>
);

const CreateEventDialog: React.FC = () => {
  const {
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    newEvent,
    handleCreateEvent,
    handleUpdateEvent,
    setNewEvent,
    uploadProgress,
  } = useEvents();
  const [activeTab, setActiveTab] = React.useState(0);
  const {
    formData,
    errors,
    handleChange,
    handleUploadConfigChange,
    validateForm,
    setErrors,
  } = useEventForm({
    ...newEvent,
    uploadConfig: newEvent.uploadConfig || defaultUploadConfig,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isCreateDialogOpen) {
      setActiveTab(0);
    }
  }, [isCreateDialogOpen]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleClose = () => {
    setIsCreateDialogOpen(false);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      console.log("Form submission started with data:", {
        formData,
        hasTitle: !!formData.title,
        hasDate: !!formData.date,
        hasLocation: !!formData.location,
        errors,
      });

      // Validate required fields first
      const requiredFields = {
        title: "Title is required",
        date: "Date is required",
        location: "Location is required",
        startTime: "Start time is required",
        endTime: "End time is required",
      };

      const newErrors: Record<string, string> = {};
      Object.entries(requiredFields).forEach(([field, message]) => {
        if (!formData[field]) {
          newErrors[field] = message;
          console.log(`Missing required field: ${field}`);
        }
      });

      if (Object.keys(newErrors).length > 0) {
        console.log("Validation failed with errors:", newErrors);
        setErrors(newErrors);
        return;
      }

      if (validateForm()) {
        console.log("Form validated successfully, submitting data:", formData);
        setNewEvent(formData);
        await new Promise((resolve) => setTimeout(resolve, 0));

        if (newEvent.id) {
          await handleUpdateEvent();
        } else {
          const eventToCreate = { ...formData };
          await handleCreateEvent(eventToCreate);
        }
        handleClose();
      }
    } catch (error) {
      console.error("Error saving event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUploading = uploadProgress > 0 && uploadProgress < 100;
  const buttonDisabled = isSubmitting || isUploading;
  const buttonText = isUploading
    ? `Uploading Image... ${uploadProgress}%`
    : isSubmitting
    ? "Creating Event..."
    : "Create Event";

  return (
    <Dialog
      open={isCreateDialogOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {newEvent.id ? "Edit Event" : "Create New Event"}
      </DialogTitle>
      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Event Details" />
          <Tab label="Upload Settings" />
        </Tabs>
      </Box>
      <DialogContent>
        <TabPanel value={activeTab} index={0}>
          <CreateEventForm
            formData={formData}
            onChange={handleChange}
            errors={errors}
            uploadProgress={uploadProgress}
          />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Configure settings for fan uploads to this event.
          </Typography>
          <UploadConfigForm
            config={formData.uploadConfig}
            onChange={handleUploadConfigChange}
            errors={errors}
          />
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={buttonDisabled}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={buttonDisabled}
        >
          {buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateEventDialog;
