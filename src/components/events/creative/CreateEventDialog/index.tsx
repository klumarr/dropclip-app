import React, { useEffect } from "react";
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
  } = useEvents();
  const [activeTab, setActiveTab] = React.useState(0);
  const {
    formData,
    errors,
    handleChange,
    handleUploadConfigChange,
    validateForm,
  } = useEventForm({
    ...newEvent,
    uploadConfig: newEvent.uploadConfig || defaultUploadConfig,
  });

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
    if (validateForm()) {
      try {
        setNewEvent(formData);

        if (newEvent.id) {
          await handleUpdateEvent();
        } else {
          await handleCreateEvent();
        }
        handleClose();
      } catch (error) {
        console.error("Error saving event:", error);
      }
    }
  };

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
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {newEvent.id ? "Save Changes" : "Create Event"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateEventDialog;
