import React from "react";
import {
  Container,
  Box,
  Alert,
  Typography,
  LinearProgress,
} from "@mui/material";
import { useEvents } from "../contexts/EventsContext";
import { ErrorBoundary } from "../components/common/ErrorBoundary";
import { LoadingState } from "../components/common/LoadingState";
import { EventsList } from "../components/events/creative/EventsList";

const EventsPage: React.FC = () => {
  const { loading, error, setError } = useEvents();

  if (loading) {
    return <LoadingState message="Loading events..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error.message}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1">
          Events
        </Typography>
      </Box>

      <ErrorBoundary>
        <EventsList />
      </ErrorBoundary>
    </Container>
  );
};

export default EventsPage;
