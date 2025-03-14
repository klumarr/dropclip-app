import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Alert,
  LinearProgress,
  Paper,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { LoadingState } from "../components/common/LoadingState";
import { UploadForm } from "../components/upload/UploadForm/index";
import { UploadGuidelines } from "../components/upload/UploadGuidelines";
import { eventOperations } from "../services/eventsService";
import { Event, UploadConfig } from "../types/events";

export default function FanUploadPage() {
  const { eventId, linkId } = useParams<{ eventId: string; linkId: string }>();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [uploadConfig, setUploadConfig] = useState<UploadConfig | null>(null);

  const validateAndFetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!eventId || !linkId) {
        throw new Error("Invalid URL parameters");
      }

      // First validate the upload link
      const isValid = await eventOperations.validateUploadLink(eventId, linkId);
      if (!isValid) {
        setError(new Error("Invalid or expired upload link"));
        setLoading(false);
        return;
      }

      // Fetch event details
      const eventData = await eventOperations.getPublicEventById(eventId);
      setEvent(eventData);

      // Fetch upload configuration
      const config = await eventOperations.getUploadConfig(eventId, linkId);
      setUploadConfig(config as any);
    } catch (error) {
      console.error("Error validating upload link:", error);
      setError(
        error instanceof Error
          ? error
          : new Error("Failed to validate upload link")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    validateAndFetchConfig();
  }, [eventId, linkId]);

  if (isAuthLoading || loading) {
    return <LoadingState message="Verifying upload access..." />;
  }

  if (!user?.id) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Authentication Required
        </Alert>
        <Typography variant="body1" align="center">
          Please sign in to upload content
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
        <Typography variant="body1" align="center">
          Please check your upload link and try again
        </Typography>
      </Container>
    );
  }

  if (!event || !uploadConfig) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load event details
        </Alert>
        <Typography variant="body1" align="center">
          Please try again later
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Upload Content
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {event.title}
      </Typography>

      <Box sx={{ mt: 4, display: "flex", gap: 3, flexWrap: "wrap" }}>
        <Box sx={{ flex: "1 1 400px", minWidth: 0 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <UploadForm
              eventId={eventId!}
              linkId={linkId!}
              uploadConfig={uploadConfig}
              onSuccess={() => navigate(`/events/${eventId}`)}
            />
          </Paper>
        </Box>

        <Box sx={{ flex: "0 0 300px" }}>
          <UploadGuidelines
            maxFileSize={uploadConfig.maxFileSize}
            allowedTypes={uploadConfig.allowedTypes}
            startTime={uploadConfig.startTime}
            endTime={uploadConfig.endTime}
            remainingUploads={
              uploadConfig.remainingUploads || uploadConfig.maxFiles || 0
            }
          />
        </Box>
      </Box>
    </Container>
  );
}
