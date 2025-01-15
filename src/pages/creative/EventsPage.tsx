import React, { useEffect, useRef, useState } from "react";
import { Box, Alert, Snackbar, Typography } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { useEvents } from "../../contexts/EventsContext";
import { EventCardList } from "../../components/events/creative/EventList/EventCardList";
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
    setNewEvent,
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

  const handleEventDetected = (eventData: Partial<EventFormData>) => {
    setNewEvent(eventData);
    setIsCreateDialogOpen(true);
  };

  const handleAlertClose = () => {
    setShowSuccessAlert(false);
    setShowErrorAlert(false);
  };

  return (
    <Box sx={{ height: "100%", position: "relative" }}>
      {loading ? (
        <Typography>Loading events...</Typography>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <EventCardList
          events={events}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
        />
      )}

      <ActionButtons
        onCreateClick={() => setIsCreateDialogOpen(true)}
        onScanClick={() => setIsScannerOpen(true)}
      />

      <CreateEventDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <EditEventDialog
        open={!!eventToEdit}
        event={eventToEdit}
        onClose={() => setEventToEdit(null)}
        onSubmit={handleEditSubmit}
      />

      <DeleteConfirmationDialog
        open={!!eventToDelete}
        event={eventToDelete}
        onClose={() => setEventToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      <FlyerScanner
        open={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onEventDetected={(eventData) => {
          setNewEvent(eventData);
          setIsCreateDialogOpen(true);
        }}
      />

      <Snackbar
        open={showSuccessAlert}
        autoHideDuration={6000}
        onClose={() => setShowSuccessAlert(false)}
      >
        <Alert severity="success">Event updated successfully!</Alert>
      </Snackbar>

      <Snackbar
        open={showErrorAlert}
        autoHideDuration={6000}
        onClose={() => setShowErrorAlert(false)}
      >
        <Alert severity="error">{errorMessage}</Alert>
      </Snackbar>
    </Box>
  );
};

export default EventsPage;
