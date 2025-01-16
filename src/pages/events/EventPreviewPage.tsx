import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useEvents } from "../../contexts/EventsContext";
import { Event } from "../../types/events";
import { CircularProgress, Container, Alert, Box } from "@mui/material";
import EventCard from "../../components/events/common/EventCard";

export const EventPreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getPublicEvent } = useEvents();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) {
        setError("Event ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("EventPreviewPage - Fetching event:", id);
        const eventData = await getPublicEvent(id);

        if (!eventData) {
          console.log("EventPreviewPage - Event not found:", id);
          setError("Event not found");
          return;
        }

        console.log("EventPreviewPage - Event loaded successfully:", eventData);
        setEvent(eventData);
      } catch (error) {
        console.error("EventPreviewPage - Error loading event:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load event"
        );
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id, getPublicEvent]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="info">Event not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <EventCard event={event} isPublicView />
    </Container>
  );
};

export default EventPreviewPage;
