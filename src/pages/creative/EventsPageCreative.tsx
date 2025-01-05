import React, { useEffect } from "react";
import { Container, Box } from "@mui/material";
import { useEvents } from "../../contexts/EventsContext";
import { ErrorBoundary } from "../../components/common/ErrorBoundary";
import { LoadingState } from "../../components/common/LoadingState";
import EventsList from "../../components/events/creative/EventsList";
import EventActions from "../../components/events/creative/EventActions";
import CreateEventDialog from "../../components/events/creative/CreateEventDialog";
import FlyerScanner from "../../components/events/common/FlyerScanner";
import { defaultUploadConfig } from "../../types/events";
import { useAuth } from "../../contexts/AuthContext";

const EventsPageCreative: React.FC = () => {
  const { user } = useAuth();
  const {
    fetchEvents,
    error,
    isLoading,
    isScannerOpen,
    setIsScannerOpen,
    handleScannedEvent,
  } = useEvents();

  useEffect(() => {
    if (user) {
      console.log("Fetching events for user:", user.id);
      fetchEvents();
    }
  }, [user, fetchEvents]);

  return (
    <ErrorBoundary>
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        {error && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              bgcolor: "error.main",
              color: "error.contrastText",
              borderRadius: 1,
            }}
          >
            {error}
          </Box>
        )}

        {isLoading ? (
          <LoadingState message="Loading events..." />
        ) : (
          <>
            <EventsList />
            <EventActions />
            <CreateEventDialog />
            <FlyerScanner
              open={isScannerOpen}
              onClose={() => setIsScannerOpen(false)}
              onEventDetected={handleScannedEvent}
            />
          </>
        )}
      </Container>
    </ErrorBoundary>
  );
};

export default EventsPageCreative;
