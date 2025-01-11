import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { s3Operations } from "../../services/s3.service";
import { eventOperations } from "../../services/eventsService";
import { Event, EventFormData, initialEventFormData } from "../../types/events";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  CircularProgress,
  Backdrop,
  Snackbar,
  Alert,
  Container,
  useTheme,
  useMediaQuery,
  LinearProgress,
} from "@mui/material";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

// Constants
const EVENTS_TABLE_NAME = process.env.REACT_APP_EVENTS_TABLE_NAME || "events";

// Initialize DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

interface EventsState {
  upcoming: Event[];
  past: Event[];
}

export default function EventsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useAuth();

  // State declarations
  const [events, setEvents] = useState<EventsState>({ upcoming: [], past: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const [formData, setFormData] = useState<EventFormData>(initialEventFormData);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const fetchedEvents = await eventOperations.listEvents(user.id);
      const now = new Date();

      // Categorize events into upcoming and past
      const categorizedEvents = fetchedEvents.reduce(
        (acc, event) => {
          const eventDate = new Date(event.date);
          if (eventDate > now) {
            acc.upcoming.push(event);
          } else {
            acc.past.push(event);
          }
          return acc;
        },
        { upcoming: [] as Event[], past: [] as Event[] }
      );

      setEvents(categorizedEvents);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialEventFormData);
    setFormErrors({});
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    resetForm();
    setSelectedEvent(null);
  };

  const handleSaveEvent = async () => {
    if (!user) {
      setError("Please sign in to create or edit events.");
      return;
    }

    // Validate form
    const errors: Record<string, string> = {};
    if (!formData.title) errors.title = "Title is required";
    if (!formData.date) errors.date = "Date is required";
    if (!formData.location) errors.location = "Location is required";
    if (formData.description.length > 500) {
      errors.description = "Description must be less than 500 characters";
    }
    if (formData.ticketLink && !formData.ticketLink.startsWith("http")) {
      errors.ticketLink = "Ticket link must be a valid URL";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (selectedEvent) {
        await eventOperations.updateEvent(user.id, selectedEvent.id, formData);
      } else {
        await eventOperations.createEvent(user.id, formData);
      }

      await fetchEvents();
      handleCloseDialog();
    } catch (err) {
      console.error("Error saving event:", err);
      setError("Failed to save event. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!user || !eventToDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      await eventOperations.deleteEvent(user.id, eventToDelete.id);
      await fetchEvents();
      setEventToDelete(null);
    } catch (err) {
      console.error("Error deleting event:", err);
      setError("Failed to delete event. Please try again later.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImageClick = (event: Event) => {
    if (event.imageUrl) {
      setSelectedImage(event.imageUrl);
      setIsImageDialogOpen(true);
    }
  };

  const handleCloseImageDialog = () => {
    setSelectedImage(undefined);
    setIsImageDialogOpen(false);
  };

  const handleFlyerUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user) {
      setError("Please sign in to upload images.");
      return;
    }

    // Validate file type and size
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPEG, PNG, or GIF)");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("File size must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      const key = `events/${user.id}/${Date.now()}_${file.name}`;

      // Upload with progress tracking
      await s3Operations.uploadFile(file, key, (progress) => {
        setUploadProgress(Math.round(progress));
      });

      const imageUrl = await s3Operations.getFileUrl(key);
      setFormData((prev) => ({
        ...prev,
        imageUrl,
        imageFile: file,
        uploadConfig: {
          ...prev.uploadConfig,
          enabled: true,
        },
      }));

      setSuccessMessage("Image uploaded successfully");
    } catch (err) {
      console.error("Error uploading image:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload image. Please try again."
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEditEvent = (event: Event) => {
    setFormData({
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      description: event.description,
      ticketLink: event.ticketLink,
      uploadConfig: event.uploadConfig || {
        enabled: false,
        allowedTypes: ["image/*"],
        maxFileSize: 5,
      },
    });
    setSelectedEvent(event);
    setIsCreateDialogOpen(true);
  };

  return (
    <Container maxWidth="lg">
      {/* Loading State */}
      <Backdrop open={isLoading} sx={{ zIndex: 9999 }}>
        <CircularProgress />
      </Backdrop>

      {/* Notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
      >
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Main Content */}
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
          <Typography variant="h4">Events</Typography>
          <Button
            variant="contained"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Create Event
          </Button>
        </Box>

        {/* Upcoming Events */}
        <Typography variant="h5" gutterBottom>
          Upcoming Events
        </Typography>
        <Grid container spacing={isMobile ? 2 : 3}>
          {events.upcoming.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Box
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                {event.imageUrl && (
                  <Box
                    component="img"
                    src={event.imageUrl}
                    alt={event.title}
                    sx={{
                      width: "100%",
                      height: 200,
                      objectFit: "cover",
                      cursor: "pointer",
                      mb: 2,
                    }}
                    onClick={() => handleImageClick(event)}
                  />
                )}
                <Typography variant="h6">{event.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.date} • {event.startTime} - {event.endTime}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.location}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button size="small" onClick={() => handleEditEvent(event)}>
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => {
                      setEventToDelete(event);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Past Events */}
        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Past Events
        </Typography>
        <Grid container spacing={isMobile ? 2 : 3}>
          {events.past.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Box
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  opacity: 0.7,
                }}
              >
                {event.imageUrl && (
                  <Box
                    component="img"
                    src={event.imageUrl}
                    alt={event.title}
                    sx={{
                      width: "100%",
                      height: 200,
                      objectFit: "cover",
                      cursor: "pointer",
                      mb: 2,
                    }}
                    onClick={() => handleImageClick(event)}
                  />
                )}
                <Typography variant="h6">{event.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.date} • {event.startTime} - {event.endTime}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.location}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() =>
          !isLoading && !isUploading && setIsCreateDialogOpen(false)
        }
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedEvent ? "Edit Event" : "Create New Event"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  error={!!formErrors.title}
                  helperText={formErrors.title}
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  InputLabelProps={{ shrink: true }}
                  error={!!formErrors.date}
                  helperText={formErrors.date}
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  error={!!formErrors.location}
                  helperText={formErrors.location}
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Start Time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      startTime: e.target.value,
                    }))
                  }
                  InputLabelProps={{ shrink: true }}
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="End Time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      endTime: e.target.value,
                    }))
                  }
                  InputLabelProps={{ shrink: true }}
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ticket Link"
                  value={formData.ticketLink}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ticketLink: e.target.value,
                    }))
                  }
                  error={!!formErrors.ticketLink}
                  helperText={formErrors.ticketLink}
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ width: "100%" }}>
                  <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    disabled={isLoading || isUploading}
                    startIcon={
                      isUploading ? <CircularProgress size={20} /> : undefined
                    }
                  >
                    {isUploading
                      ? `Uploading... ${uploadProgress}%`
                      : "Upload Event Image"}
                    <input
                      type="file"
                      hidden
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleFlyerUpload}
                      disabled={isUploading}
                    />
                  </Button>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <Box sx={{ width: "100%", mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={uploadProgress}
                      />
                    </Box>
                  )}
                  {formData.imageUrl && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: "block" }}
                    >
                      Image uploaded successfully
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsCreateDialogOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEvent}
            disabled={isLoading}
          >
            {isLoading
              ? selectedEvent
                ? "Saving..."
                : "Creating..."
              : selectedEvent
              ? "Save Changes"
              : "Create Event"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => !isDeleting && setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this event? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteEvent}
            color="error"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog
        open={isImageDialogOpen}
        onClose={handleCloseImageDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt="Event"
              sx={{
                width: "100%",
                height: "auto",
                maxHeight: "80vh",
                objectFit: "contain",
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImageDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
