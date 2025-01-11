import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Alert,
  Typography,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Grid,
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingState } from "../../components/common/LoadingState";
import { eventOperations } from "../../services/eventsService";
import { Event } from "../../types/events";
import FanEventCard from "../../components/events/fan/FanEventCard";

// Fan-specific event type that extends the base Event type
interface FanEventType extends Event {
  status: "upcoming" | "past";
}

export default function EventsPageFan() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user, isLoading: isAuthLoading } = useAuth();

  // State declarations
  const [events, setEvents] = useState<FanEventType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);

  // Fetch events when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      fetchEvents();
    }
  }, [user?.id]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching events for fan:", user?.id);
      const response = await eventOperations.getFanEvents(user?.id || "");

      // Process events and add status
      const now = new Date();
      const processedEvents = response.map((event) => {
        const status = new Date(event.date) >= now ? "upcoming" : "past";
        return {
          ...event,
          status,
        } as FanEventType;
      });

      setEvents(processedEvents);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch events");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading) {
    return <LoadingState message="Verifying credentials..." />;
  }

  if (!user?.id) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Authentication Required
        </Alert>
        <Typography variant="body1" align="center">
          Please sign in to view events
        </Typography>
      </Container>
    );
  }

  const upcomingEvents = events.filter((event) => event.status === "upcoming");
  const pastEvents = events.filter((event) => event.status === "past");

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        centered={!isMobile}
        variant={isMobile ? "fullWidth" : "standard"}
        sx={{ mb: 3 }}
      >
        <Tab label={`Upcoming (${upcomingEvents.length})`} />
        <Tab label={`Past (${pastEvents.length})`} />
      </Tabs>

      <Grid container spacing={3}>
        {(selectedTab === 0 ? upcomingEvents : pastEvents).map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <FanEventCard event={event} isPast={event.status === "past"} />
          </Grid>
        ))}
      </Grid>

      {!isLoading && events.length === 0 && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No events found
          </Typography>
        </Box>
      )}
    </Container>
  );
}
