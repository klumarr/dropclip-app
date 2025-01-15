import React, { useEffect, useRef, useState } from "react";
import { Box, Alert, Snackbar, Typography } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { useEvents } from "../../contexts/EventsContext";
import { EventList } from "../../components/events/creative/EventList";
import { DeleteConfirmationDialog } from "../../components/events/creative/DeleteConfirmationDialog";
import { CreateEventDialog } from "../../components/events/creative/CreateEventDialog";
import { EditEventDialog } from "../../components/events/creative/EditEventDialog";
import { Event, EventFormData } from "../../types/events";
import ActionButtons from "../../components/events/creative/ActionButtons";
import { FlyerScanner } from "../../components/events/creative/FlyerScanner";

const EventsPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const {
    events,
    loading,
    error,
    fetchEvents,
    deleteEvent,
    createEvent,
    updateEvent,
  } = useEvents();
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    console.log("EventsPage - Component mounted");
    if (isAuthenticated && user?.id) {
      fetchEvents();
    }
    return () => {
      console.log("EventsPage - Component unmounting");
      isMounted.current = false;
    };
  }, [isAuthenticated, user?.id]);

  const handleDeleteClick = (event: Event) => {
    console.log("Delete clicked for event:", event.name);
    setEventToDelete(event);
  };

  const handleEditClick = (event: Event) => {
    console.log("Edit clicked for event:", event.name);
    setEventToEdit(event);
  };

  const handleDeleteClose = () => {
    setEventToDelete(null);
  };

  const handleEditClose = () => {
    setEventToEdit(null);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;

    try {
      setIsDeleting(true);
      await deleteEvent(eventToDelete.id);
      setEventToDelete(null);
      setIsDeleting(false);
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("Error deleting event:", error);
      setIsDeleting(false);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to delete event"
      );
      setShowErrorAlert(true);
    }
  };

  const handleCreateClick = () => {
    console.log("Create event clicked");
    setIsCreateDialogOpen(true);
  };

  const handleCreateSubmit = async (formData: EventFormData) => {
    try {
      await createEvent(formData);
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  };

  const handleEditSubmit = async (eventId: string, formData: EventFormData) => {
    try {
      await updateEvent(eventId, formData);
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  };

  const handleScanClick = () => {
    console.log("Opening flyer scanner");
    setIsScannerOpen(true);
  };

  const handleScanClose = () => {
    setIsScannerOpen(false);
  };

  const handleEventDetected = async (eventData: Partial<EventFormData>) => {
    try {
      if (!eventData.name) {
        throw new Error("Event name is required");
      }
      await createEvent(eventData as EventFormData);
      setShowSuccessAlert(true);
      setIsScannerOpen(false);
    } catch (error) {
      console.error("Error creating event from scan:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to create event"
      );
      setShowErrorAlert(true);
    }
  };

  const handleAlertClose = () => {
    setShowSuccessAlert(false);
    setShowErrorAlert(false);
  };

  return (
    <Box sx={{ p: 3, position: "relative", minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom>
        Events
      </Typography>
      <EventList
        events={events || []}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />
      <ActionButtons
        onCreateClick={handleCreateClick}
        onScanClick={handleScanClick}
      />
      {eventToDelete && (
        <DeleteConfirmationDialog
          event={eventToDelete}
          open={Boolean(eventToDelete)}
          onClose={handleDeleteClose}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />
      )}
      <CreateEventDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateSubmit}
      />
      {eventToEdit && (
        <EditEventDialog
          event={eventToEdit}
          open={Boolean(eventToEdit)}
          onClose={handleEditClose}
          onSubmit={handleEditSubmit}
        />
      )}
      <FlyerScanner
        open={isScannerOpen}
        onClose={handleScanClose}
        onEventDetected={handleEventDetected}
      />
      <Snackbar
        open={showSuccessAlert}
        autoHideDuration={6000}
        onClose={handleAlertClose}
      >
        <Alert severity="success">
          Event operation completed successfully!
        </Alert>
      </Snackbar>
      <Snackbar
        open={showErrorAlert}
        autoHideDuration={6000}
        onClose={handleAlertClose}
      >
        <Alert severity="error">{errorMessage}</Alert>
      </Snackbar>
    </Box>
  );
};

export default EventsPage;
