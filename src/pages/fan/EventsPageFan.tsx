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
  CheckCircle,
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
import { followService } from "../../services/follow.service";
import { attendanceService } from "../../services/attendance.service";
import { Event } from "../../types/events";
import useFollowStatus from "../../hooks/useFollowStatus";
import useAttendanceStatus from "../../hooks/useAttendanceStatus";

// Fan-specific event type that extends the base Event type
interface FanEventType extends Event {
  status: "upcoming" | "past";
  user_id: string;
  startTime: string;
  endTime: string;
  ticketLink: string;
  isAutomatic?: boolean;
  uploadConfig: {
    enabled: boolean;
    allowedTypes: string[];
    maxFileSize: number;
  };
  created_at?: string;
  updated_at?: string;
  attendees?: number;
  isInterested?: boolean;
}

interface CategorizedEvents {
  upcoming: FanEventType[];
  past: FanEventType[];
  automatic: FanEventType[];
}

// Styled components for upload functionality
const UploadContainer = styled("div")(({ theme }) => ({
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

  // Add loading state for attendance toggle
  const [attendanceLoading, setAttendanceLoading] = useState<string | null>(
    null
  );

  const fetchEvents = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get followed creatives
      const followedCreatives = await followService.getFanFollowing(user.id);
      console.log("Followed creatives:", followedCreatives);

      // Get events for each creative
      const eventsData = await eventOperations.getFanEvents();
      console.log("All events:", eventsData);

      // Filter events to only show those from followed creatives
      const followedEvents = eventsData.filter((event) =>
        followedCreatives.includes(event.user_id)
      );
      console.log("Filtered events:", followedEvents);

      // Get attendance status for all events
      const attendedEvents = await attendanceService.getUserAttendedEvents(
        user.id
      );
      console.log("Attended events:", attendedEvents);

      const now = new Date();
      const categorizedEvents = followedEvents.reduce<CategorizedEvents>(
        (acc, event) => {
          const eventDate = new Date(event.date);
          const fanEvent: FanEventType = {
            ...event,
            status: eventDate >= now ? "upcoming" : "past",
            isInterested: attendedEvents.includes(event.id),
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

  const handleAttendanceToggle = async (event: FanEventType) => {
    if (!user) return;

    setAttendanceLoading(event.id);
    try {
      if (event.isInterested) {
        await attendanceService.unmarkAttendance(user.id, event.id);
      } else {
        await attendanceService.markAttendance(user.id, event.id);
      }
      fetchEvents(); // Refresh events to update attendance status
    } catch (error) {
      console.error("Error toggling attendance:", error);
      setError("Failed to update attendance status. Please try again.");
    } finally {
      setAttendanceLoading(null);
    }
  };

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
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError("Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress({});
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
                        image={
                          event.imageUrl ||
                          "https://via.placeholder.com/320x180"
                        }
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
                                  {event.startTime}
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
                                  {event.attendees || 0} attendees
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                          <Button
                            variant={
                              event.isInterested ? "contained" : "outlined"
                            }
                            color={event.isInterested ? "primary" : "inherit"}
                            onClick={() => handleAttendanceToggle(event)}
                            startIcon={
                              attendanceLoading === event.id ? (
                                <CircularProgress size={20} />
                              ) : event.isInterested ? (
                                <CheckCircle />
                              ) : (
                                <EventIcon />
                              )
                            }
                            disabled={attendanceLoading === event.id}
                            fullWidth
                          >
                            {event.isInterested ? "Attending" : "Attend"}
                          </Button>
                          <IconButton
                            onClick={(e) => {
                              setSelectedEvent(event);
                              setAnchorEl(e.currentTarget);
                            }}
                          >
                            <MoreVert />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )
              )}
            </Grid>
          </Grid>
        )}

        {/* Add no events message */}
        {!isLoading &&
          (activeTab === 0 ? events.upcoming : events.past).length === 0 && (
            <Grid item xs={12}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                py={8}
              >
                <EventIcon
                  sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {activeTab === 0
                    ? "No upcoming events from creatives you follow"
                    : "No past events to show"}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/fan/search")}
                  sx={{ mt: 2 }}
                >
                  Discover Creatives
                </Button>
              </Box>
            </Grid>
          )}
      </Grid>

      {/* Event Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            if (selectedEvent?.uploadConfig.enabled) {
              setIsUploadDialogOpen(true);
            }
            setAnchorEl(null);
          }}
          disabled={!selectedEvent?.uploadConfig.enabled}
        >
          <ListItemIcon>
            <CloudUpload fontSize="small" />
          </ListItemIcon>
          Upload Content
        </MenuItem>
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
      </Menu>

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

          <Box
            component="label"
            htmlFor="file-input"
            sx={{
              border: `2px dashed ${theme.palette.divider}`,
              borderRadius: theme.shape.borderRadius,
              padding: theme.spacing(3),
              textAlign: "center",
              backgroundColor: theme.palette.background.paper,
              cursor: "pointer",
              transition: "border-color 0.3s ease",
              mb: 2,
              "&:hover": {
                borderColor: theme.palette.primary.main,
              },
            }}
          >
            <input
              id="file-input"
              type="file"
              multiple
              accept={selectedEvent?.uploadConfig.allowedTypes.join(",")}
              onChange={(e) => handleFileSelect(e.target.files)}
              style={{ display: "none" }}
              disabled={isUploading}
            />
            <CloudUpload sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drop files here or click to upload
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Maximum file size:{" "}
              {selectedEvent?.uploadConfig.maxFileSize / (1024 * 1024)}MB
            </Typography>
          </Box>

          {selectedFiles.length > 0 && (
            <FilePreviewContainer>
              {selectedFiles.map((file) => (
                <Box key={file.name} sx={{ width: "100%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    {file.type.startsWith("image/") ? (
                      <Image sx={{ mr: 1 }} />
                    ) : (
                      <VideoFile sx={{ mr: 1 }} />
                    )}
                    <Typography variant="body2" noWrap>
                      {file.name}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress[file.name] || 0}
                  />
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
    </Box>
  );
};

export default EventsPageFan;
