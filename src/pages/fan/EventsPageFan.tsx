import { useState, useEffect } from "react";
import {
  Box,
  CircularProgress,
  Container,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Grid,
  Alert,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  ListItemIcon,
  FormLabel,
} from "@mui/material";
import {
  MoreVert,
  Share,
  Event as EventIcon,
  LocationOn,
  People,
  Star,
  StarBorder,
  CloudUpload,
  Close,
  Image,
  VideoFile,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useAuth } from "../../contexts/AuthContext";
import EventCard from "../../components/events/common/EventCard";
import {
  ScrollSection,
  EventsRow,
} from "../../components/events/common/EventsPageStyles";
import { eventOperations } from "../../services/eventsService";
import { s3Operations } from "../../services/s3.service";
import { contentOperations } from "../../services/content.service";
import { Event } from "../../types/events";

// Fan-specific event type that extends the base Event type
interface FanEventType extends Event {
  status: "upcoming" | "past";
  thumbnailUrl: string;
  time: string;
  attendees: number;
  isInterested: boolean;
  uploadConfig: {
    enabled: boolean;
    allowedTypes: string[];
    maxFileSize: number;
  };
}

interface CategorizedEvents {
  upcoming: FanEventType[];
  past: FanEventType[];
  automatic: FanEventType[];
}

// Styled components for upload functionality
const UploadContainer = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: "center",
  backgroundColor: theme.palette.background.paper,
  cursor: "pointer",
  transition: "border-color 0.3s ease",
  "&:hover": {
    borderColor: theme.palette.primary.main,
  },
}));

const FilePreviewContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1),
}));

const EventsPageFan: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useAuth();

  const [events, setEvents] = useState<CategorizedEvents>({
    upcoming: [],
    past: [],
    automatic: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<FanEventType | null>(null);

  // Upload state
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchEvents = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const eventsData = await eventOperations.getFanEvents();

      const now = new Date();
      const categorizedEvents = eventsData.reduce<CategorizedEvents>(
        (acc, event) => {
          const eventDate = new Date(event.date);
          const fanEvent: FanEventType = {
            ...event,
            status: eventDate >= now ? "upcoming" : "past",
            thumbnailUrl: event.imageUrl || "",
            time: event.startTime || "",
            attendees: event.attendees || 0,
            isInterested: event.isInterested || false,
            uploadConfig: event.uploadConfig || {
              enabled: false,
              allowedTypes: ["image/*", "video/*"],
              maxFileSize: 100 * 1024 * 1024,
            },
          };

          if (event.isAutomatic) {
            acc.automatic.push(fanEvent);
          } else if (eventDate >= now) {
            acc.upcoming.push(fanEvent);
          } else {
            acc.past.push(fanEvent);
          }
          return acc;
        },
        { upcoming: [], past: [], automatic: [] }
      );

      // Sort each category
      const sortByDate = (a: FanEventType, b: FanEventType) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      };

      categorizedEvents.upcoming.sort(sortByDate);
      categorizedEvents.past.sort(sortByDate);
      categorizedEvents.automatic.sort(sortByDate);

      setEvents(categorizedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to fetch events");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    setSelectedFiles(Array.from(files));
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (!selectedEvent || !selectedFiles.length || !user) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      for (const file of selectedFiles) {
        const key = `events/${selectedEvent.id}/${Date.now()}-${file.name}`;

        // Upload to S3
        await s3Operations.uploadFile(file, key, (progress) => {
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: progress,
          }));
        });

        // Create content record
        await contentOperations.createContent({
          eventId: selectedEvent.id,
          userId: user.id,
          fileUrl: key,
          type: file.type,
        });
      }

      setSelectedFiles([]);
      setIsUploadDialogOpen(false);
      fetchEventContent(selectedEvent.id);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError("Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const fetchEventContent = async (eventId: string) => {
    try {
      const content = await contentOperations.getEventContent(eventId);
      console.log("Fetched content for event:", eventId, content);
    } catch (error) {
      console.error("Failed to fetch event content:", error);
    }
  };

  const handleInterestToggle = () => {
    if (selectedEvent) {
      console.log(
        `${
          selectedEvent.isInterested ? "Removing" : "Adding"
        } interest for event:`,
        selectedEvent.id
      );
      setAnchorEl(null);
    }
  };

  const handleEditEvent = async (event: FanEventType) => {
    try {
      await eventOperations.updateEvent(event.id, event);
      fetchEvents();
    } catch (error) {
      console.error("Error updating event:", error);
      setError("Failed to update event");
    }
  };

  const handleDeleteEvent = async (event: FanEventType) => {
    try {
      await eventOperations.deleteEvent(event.id);
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      setError("Failed to delete event");
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
          >
            <Tab label="Upcoming Events" />
            <Tab label="Past Events" />
          </Tabs>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}

        {isLoading ? (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          </Grid>
        ) : (
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {(activeTab === 0 ? events.upcoming : events.past).map(
                (event) => (
                  <Grid item xs={12} sm={6} md={4} key={event.id}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="180"
                        image={event.thumbnailUrl}
                        alt={event.title}
                      />
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {event.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          {event.description}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Grid container spacing={1}>
                            <Grid item xs={12}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <EventIcon fontSize="small" />
                                <Typography variant="body2">
                                  {new Date(event.date).toLocaleDateString()} at{" "}
                                  {event.time}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <LocationOn fontSize="small" />
                                <Typography variant="body2">
                                  {event.location}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <People fontSize="small" />
                                <Typography variant="body2">
                                  {event.attendees} attendees
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          p: 1,
                          borderTop: 1,
                          borderColor: "divider",
                        }}
                      >
                        <IconButton
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsUploadDialogOpen(true);
                          }}
                          disabled={!event.uploadConfig.enabled}
                        >
                          <CloudUpload />
                        </IconButton>
                        <IconButton
                          onClick={(e) => {
                            setSelectedEvent(event);
                            setAnchorEl(e.currentTarget);
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>
                    </Card>
                  </Grid>
                )
              )}
            </Grid>
          </Grid>
        )}
      </Grid>

      {/* Upload Dialog */}
      <Dialog
        open={isUploadDialogOpen}
        onClose={() => !isUploading && setIsUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Upload Content
          {!isUploading && (
            <IconButton
              onClick={() => setIsUploadDialogOpen(false)}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent>
          {uploadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {uploadError}
            </Alert>
          )}
          <FormLabel
            htmlFor="file-input"
            sx={{
              mt: 2,
              width: "100%",
              display: "block",
              cursor: "pointer",
            }}
          >
            <UploadContainer>
              <input
                id="file-input"
                type="file"
                multiple
                accept={selectedEvent?.uploadConfig.allowedTypes.join(",")}
                onChange={(e) => handleFileSelect(e.target.files)}
                style={{ display: "none" }}
              />
              <CloudUpload sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Drop files here or click to upload
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supported formats:{" "}
                {selectedEvent?.uploadConfig.allowedTypes.join(", ")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Max file size:{" "}
                {(selectedEvent?.uploadConfig.maxFileSize || 0) / (1024 * 1024)}
                MB
              </Typography>
            </UploadContainer>
          </FormLabel>

          {selectedFiles.length > 0 && (
            <FilePreviewContainer>
              {selectedFiles.map((file) => (
                <Box
                  key={file.name}
                  sx={{
                    p: 1,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    {file.type.startsWith("image/") ? <Image /> : <VideoFile />}
                    <Typography variant="body2" noWrap>
                      {file.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setSelectedFiles((prev) =>
                          prev.filter((f) => f !== file)
                        )
                      }
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                  {uploadProgress[file.name] !== undefined && (
                    <LinearProgress
                      variant="determinate"
                      value={uploadProgress[file.name]}
                    />
                  )}
                </Box>
              ))}
            </FilePreviewContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsUploadDialogOpen(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
            variant="contained"
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Event Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            console.log("View content for event:", selectedEvent?.id);
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <Image fontSize="small" />
          </ListItemIcon>
          View Content
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          Share Event
        </MenuItem>
        <MenuItem onClick={handleInterestToggle}>
          <ListItemIcon>
            {selectedEvent?.isInterested ? (
              <Star fontSize="small" />
            ) : (
              <StarBorder fontSize="small" />
            )}
          </ListItemIcon>
          {selectedEvent?.isInterested
            ? "Remove Interest"
            : "Mark as Interested"}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default EventsPageFan;
