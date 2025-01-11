import React, { Suspense } from "react";
import {
  Container,
  Box,
  Alert,
  Typography,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Button,
} from "@mui/material";
import { useEvents } from "../../contexts/EventsContext";
import { ErrorBoundary } from "../../components/common/ErrorBoundary";
import { LoadingState } from "../../components/common/LoadingState";
import { EventsList } from "../../components/events/creative/EventsList";
import CreateEventButton from "../../components/events/creative/CreateEventButton";
import { CreateEventDialog } from "../../components/events/creative/CreateEventDialog";
import { useAuth } from "../../contexts/AuthContext";
import { Add as AddIcon } from "@mui/icons-material";

const EventsContent = () => {
  const { loading, error, setError } = useEvents();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

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
          Please sign in to manage your events
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error.message}
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1">
          My Events
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          Create Event
        </Button>
      </Box>

      <EventsList />

      <CreateEventDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
    </Container>
  );
};

export default function EventsPageCreative() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState message="Loading events page..." />}>
        <EventsContent />
      </Suspense>
    </ErrorBoundary>
  );
}
