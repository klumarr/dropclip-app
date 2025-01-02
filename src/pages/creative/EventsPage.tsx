import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Tab,
  Tabs,
  Container,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon,
  Share as ShareIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  Link as LinkIcon,
  QrCode as QrCodeIcon,
  Message as MessageIcon,
  WhatsApp as WhatsAppIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { styled } from "@mui/material/styles";

// Styled Components
const ScrollSection = styled(Box)({
  overflowX: "auto",
  overflowY: "hidden",
  whiteSpace: "nowrap",
  padding: "8px 0",
  "&::-webkit-scrollbar": {
    height: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "#f1f1f1",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#888",
    borderRadius: "3px",
  },
});

const EventsRow = styled(Box)({
  display: "inline-flex",
  gap: "12px",
  padding: "0 12px",
});

const EventCard = styled(Box)(({ theme }) => ({
  width: "280px",
  backgroundColor: theme.palette.background.paper,
  borderRadius: "8px",
  boxShadow: theme.shadows[1],
  overflow: "hidden",
  display: "inline-block",
  verticalAlign: "top",
  transition: "transform 0.2s, box-shadow 0.2s",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[4],
  },
}));

const EventCardMedia = styled("img")({
  width: "100%",
  height: "156px",
  objectFit: "cover",
});

const EventCardContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
}));

const ActionButtonsContainer = styled(Box)(({ theme }) => ({
  position: "fixed",
  bottom: 160,
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: theme.spacing(1),
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  padding: theme.spacing(1, 2),
  borderRadius: 28,
  backdropFilter: "blur(8px)",
  boxShadow: theme.shadows[3],
  zIndex: 1000,
  [theme.breakpoints.down("sm")]: {
    width: "calc(100% - 32px)",
    justifyContent: "space-between",
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  minWidth: "80px",
  [theme.breakpoints.down("sm")]: {
    flex: 1,
  },
}));

const UploadIndicator = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  color: "#fff",
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
}));

interface Event {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location: string;
  description: string;
  imageUrl?: string;
  imageFile?: File;
  ticketLink?: string;
  isAutomatic?: boolean;
  uploadConfig?: {
    enabled: boolean;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    maxFileSize?: number;
    allowedTypes?: string[];
  };
}

interface EventFormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  ticketLink: string;
  imageUrl?: string;
  imageFile?: File;
  uploadConfig: {
    enabled: boolean;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    maxFileSize?: number;
    allowedTypes?: string[];
  };
}

const QRCodeDialog = ({
  open,
  onClose,
  eventUrl,
}: {
  open: boolean;
  onClose: () => void;
  eventUrl: string;
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Event Upload QR Code</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            p: 2,
          }}
        >
          <QRCodeSVG value={eventUrl} size={256} level="H" />
          <Typography variant="body1" align="center">
            Scan this QR code to upload content from the event
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              navigator.clipboard.writeText(eventUrl);
              alert("Link copied to clipboard!");
            }}
            startIcon={<LinkIcon />}
          >
            Copy Link
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const EventsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isFlyerScannerOpen, setIsFlyerScannerOpen] = useState(false);
  const [isSocialHubOpen, setIsSocialHubOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const [events, setEvents] = useState<{
    upcoming: Event[];
    past: Event[];
    automatic: Event[];
  }>({
    upcoming: [],
    past: [],
    automatic: [],
  });
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    location: "",
    description: "",
    ticketLink: "",
    uploadConfig: {
      enabled: false,
      maxFileSize: 100,
      allowedTypes: ["image/*", "video/*"],
    },
  });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [shareAnchorEl, setShareAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedShareEvent, setSelectedShareEvent] = useState<Event | null>(
    null
  );
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [selectedQREvent, setSelectedQREvent] = useState<Event | null>(null);

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setFormData({
      title: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "",
      endTime: "",
      location: "",
      description: "",
      ticketLink: "",
      uploadConfig: {
        enabled: false,
        maxFileSize: 100,
        allowedTypes: ["image/*", "video/*"],
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      },
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title || "",
      date: event.date || new Date().toISOString().split("T")[0],
      startTime: event.startTime || "",
      endTime: event.endTime || "",
      location: event.location || "",
      description: event.description || "",
      ticketLink: event.ticketLink || "",
      imageUrl: event.imageUrl,
      uploadConfig: event.uploadConfig || {
        enabled: false,
        maxFileSize: 100,
        allowedTypes: ["image/*", "video/*"],
      },
    });
    setIsCreateDialogOpen(true);
  };

  const handleDeleteEvent = (eventToDelete: Event) => {
    setEvents((prev) => {
      const category = prev.upcoming.find((e) => e.id === eventToDelete.id)
        ? "upcoming"
        : prev.past.find((e) => e.id === eventToDelete.id)
        ? "past"
        : "automatic";

      return {
        ...prev,
        [category]: prev[category].filter((e) => e.id !== eventToDelete.id),
      };
    });
  };

  const handleImageClick = (imageUrl: string | undefined) => {
    if (imageUrl) {
      setSelectedImage(imageUrl);
      setIsImageDialogOpen(true);
    }
  };

  const handleFlyerUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Create object URL for preview
      const imageUrl = URL.createObjectURL(file);

      // TODO: Replace with actual OCR service call
      // Mock event data extraction for now
      const mockEventData: Partial<Event> = {
        title: "Event from Flyer",
        date: new Date().toISOString().split("T")[0],
        location: "Extracted Location",
        description: "Event details extracted from flyer",
        imageUrl,
        imageFile: file,
        isAutomatic: true,
      };

      // Process the extracted event data
      handleEventDetected(mockEventData);
    } catch (error) {
      console.error("Error processing flyer:", error);
      // TODO: Show error message to user
    }
  };

  const handleEventDetected = (eventData: Partial<Event>) => {
    const newEvent: Event = {
      id: Date.now().toString(),
      title: eventData.title || "Untitled Event",
      date: eventData.date || new Date().toISOString().split("T")[0],
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      location: eventData.location || "Location TBD",
      description: eventData.description || "",
      imageUrl: eventData.imageUrl,
      imageFile: eventData.imageFile,
      ticketLink: eventData.ticketLink,
      isAutomatic: true,
    };

    setEvents((prev) => ({
      ...prev,
      automatic: [...prev.automatic, newEvent],
    }));

    setIsFlyerScannerOpen(false);
  };

  const handleSocialEventImported = (eventData: any) => {
    const newEvent: Event = {
      id: Date.now().toString(),
      title: eventData.title,
      date: new Date(eventData.date).toISOString().split("T")[0],
      location: eventData.location,
      description: eventData.description,
      isAutomatic: true,
    };

    setEvents((prev) => ({
      ...prev,
      automatic: [...prev.automatic, newEvent],
    }));
  };

  const handleDeleteConfirm = () => {
    if (eventToDelete) {
      handleDeleteEvent(eventToDelete);
      setEventToDelete(null);
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleApproveAutoEvent = (event: Event) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    const category = eventDate > now ? "upcoming" : "past";

    setEvents((prev) => ({
      ...prev,
      [category]: [...prev[category], { ...event, isAutomatic: false }],
      automatic: prev.automatic.filter((e) => e.id !== event.id),
    }));
  };

  const renderEventCard = (event: Event, isAutomatic: boolean = false) => (
    <EventCard key={event.id}>
      {event.imageUrl && (
        <EventCardMedia
          src={event.imageUrl}
          alt={event.title}
          onClick={() => handleImageClick(event.imageUrl)}
        />
      )}
      {event.uploadConfig?.enabled && (
        <UploadIndicator>
          <CloudUploadIcon />
          <Typography variant="caption">
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }) >= (event.uploadConfig.startTime || "00:00") &&
            new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }) <= (event.uploadConfig.endTime || "23:59")
              ? "Uploads Open"
              : "Uploads Scheduled"}
          </Typography>
        </UploadIndicator>
      )}
      <EventCardContent>
        <Typography variant="h6" gutterBottom>
          {event.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {event.description}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {new Date(event.date).toLocaleDateString()}
          {event.startTime && ` at ${event.startTime}`}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {event.location}
        </Typography>
        <Box
          sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}
        >
          {isAutomatic ? (
            <>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleApproveAutoEvent(event)}
              >
                Approve
              </Button>
              <IconButton
                size="small"
                onClick={() => {
                  setEventToDelete(event);
                  setIsDeleteConfirmOpen(true);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </>
          ) : (
            <>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedShareEvent(event);
                  setShareAnchorEl(e.currentTarget);
                }}
              >
                <ShareIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedQREvent(event);
                  setIsQRDialogOpen(true);
                }}
              >
                <QrCodeIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditEvent(event);
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setEventToDelete(event);
                  setIsDeleteConfirmOpen(true);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </>
          )}
        </Box>
      </EventCardContent>
    </EventCard>
  );

  return (
    <Container
      maxWidth={false}
      sx={{
        p: { xs: 1, sm: 2 },
        pb: { xs: 20, sm: 20 },
        pt: { xs: 1, sm: 1 },
        maxWidth: "1920px",
        mx: "auto",
        height: "auto",
        minHeight: "calc(100vh - 224px)",
        position: "relative",
        overflow: "auto",
      }}
    >
      <Box sx={{ mb: { xs: 2, sm: 4 } }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: { xs: 1, sm: 2 } }}
          variant={isMobile ? "fullWidth" : "standard"}
        >
          <Tab label="Upcoming" />
          <Tab label="Past" />
          <Tab label="Automatic" />
        </Tabs>

        {activeTab === 0 && (
          <ScrollSection>
            <EventsRow>
              {events.upcoming.map((event) => renderEventCard(event))}
            </EventsRow>
          </ScrollSection>
        )}

        {activeTab === 1 && (
          <ScrollSection>
            <EventsRow>
              {events.past.map((event) => renderEventCard(event))}
            </EventsRow>
          </ScrollSection>
        )}

        {activeTab === 2 && (
          <ScrollSection>
            <EventsRow>
              {events.automatic.map((event) => renderEventCard(event, true))}
            </EventsRow>
          </ScrollSection>
        )}

        <ActionButtonsContainer>
          <ActionButton
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={() => setIsSocialHubOpen(true)}
            size="small"
          >
            Social
          </ActionButton>
          <ActionButton
            variant="outlined"
            startIcon={<PhotoCameraIcon />}
            onClick={() => setIsFlyerScannerOpen(true)}
            size="small"
          >
            Scan
          </ActionButton>
          <ActionButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateEvent}
            size="small"
          >
            Create
          </ActionButton>
        </ActionButtonsContainer>
      </Box>

      {/* Dialogs */}
      <Dialog
        open={isImageDialogOpen}
        onClose={() => setIsImageDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Event"
              style={{ width: "100%", height: "auto" }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isFlyerScannerOpen}
        onClose={() => setIsFlyerScannerOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Scan Event Flyer</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFlyerUpload}
              style={{ display: "none" }}
              id="flyer-upload"
            />
            <label htmlFor="flyer-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<PhotoCameraIcon />}
              >
                Upload Flyer
              </Button>
            </label>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isSocialHubOpen}
        onClose={() => setIsSocialHubOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Import from Social Media</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FacebookIcon />}
                  onClick={() => {
                    // Implement Facebook import
                  }}
                >
                  Facebook
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<InstagramIcon />}
                  onClick={() => {
                    // Implement Instagram import
                  }}
                >
                  Instagram
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<TwitterIcon />}
                  onClick={() => {
                    // Implement Twitter import
                  }}
                >
                  Twitter
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
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
                  required
                  label="Event Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
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
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.uploadConfig.enabled}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          uploadConfig: {
                            ...prev.uploadConfig,
                            enabled: e.target.checked,
                          },
                        }))
                      }
                    />
                  }
                  label="Enable Content Uploads"
                />
              </Grid>
              {formData.uploadConfig.enabled && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Upload Start Date"
                      value={formData.uploadConfig.startDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          uploadConfig: {
                            ...prev.uploadConfig,
                            startDate: e.target.value,
                          },
                        }))
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Upload End Date"
                      value={formData.uploadConfig.endDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          uploadConfig: {
                            ...prev.uploadConfig,
                            endDate: e.target.value,
                          },
                        }))
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Upload Start Time"
                      value={formData.uploadConfig.startTime}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          uploadConfig: {
                            ...prev.uploadConfig,
                            startTime: e.target.value,
                          },
                        }))
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Upload End Time"
                      value={formData.uploadConfig.endTime}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          uploadConfig: {
                            ...prev.uploadConfig,
                            endTime: e.target.value,
                          },
                        }))
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Max File Size (MB)"
                      value={formData.uploadConfig.maxFileSize}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          uploadConfig: {
                            ...prev.uploadConfig,
                            maxFileSize: Number(e.target.value),
                          },
                        }))
                      }
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFlyerUpload}
                    style={{ display: "none" }}
                    id="event-flyer-upload"
                  />
                  <label htmlFor="event-flyer-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCameraIcon />}
                    >
                      Upload Event Flyer
                    </Button>
                  </label>
                  {formData.imageUrl && (
                    <Box sx={{ position: "relative" }}>
                      <img
                        src={formData.imageUrl}
                        alt="Event flyer preview"
                        style={{
                          width: 100,
                          height: 100,
                          objectFit: "cover",
                          borderRadius: 4,
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            imageUrl: undefined,
                            imageFile: undefined,
                          }))
                        }
                        sx={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          bgcolor: "background.paper",
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Image URL"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      imageUrl: e.target.value,
                    }))
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              const eventDate = new Date(formData.date);
              const now = new Date();
              const category = eventDate > now ? "upcoming" : "past";

              const newEvent: Event = {
                id: selectedEvent?.id || Date.now().toString(),
                title: formData.title,
                date: formData.date,
                startTime: formData.startTime,
                endTime: formData.endTime,
                location: formData.location,
                description: formData.description,
                imageUrl: formData.imageUrl,
                imageFile: formData.imageFile,
                ticketLink: formData.ticketLink,
                uploadConfig: formData.uploadConfig,
              };

              setEvents((prev) => {
                if (selectedEvent) {
                  // Update existing event
                  const currentCategory = prev.upcoming.find(
                    (e) => e.id === selectedEvent.id
                  )
                    ? "upcoming"
                    : prev.past.find((e) => e.id === selectedEvent.id)
                    ? "past"
                    : "automatic";

                  return {
                    ...prev,
                    [currentCategory]: prev[currentCategory].map((e) =>
                      e.id === selectedEvent.id ? newEvent : e
                    ),
                  };
                } else {
                  // Add new event
                  return {
                    ...prev,
                    [category]: [...prev[category], newEvent],
                  };
                }
              });

              setIsCreateDialogOpen(false);
              setSelectedEvent(null);
              setFormData({
                title: "",
                date: new Date().toISOString().split("T")[0],
                startTime: "",
                endTime: "",
                location: "",
                description: "",
                ticketLink: "",
                uploadConfig: {
                  enabled: false,
                  maxFileSize: 100,
                  allowedTypes: ["image/*", "video/*"],
                },
              });
            }}
          >
            {selectedEvent ? "Save Changes" : "Create Event"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this event? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={shareAnchorEl}
        open={Boolean(shareAnchorEl)}
        onClose={() => setShareAnchorEl(null)}
      >
        <MenuItem onClick={() => setShareAnchorEl(null)}>
          <ListItemIcon>
            <FacebookIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share on Facebook</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => setShareAnchorEl(null)}>
          <ListItemIcon>
            <TwitterIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share on Twitter</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => setShareAnchorEl(null)}>
          <ListItemIcon>
            <InstagramIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share on Instagram</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => setShareAnchorEl(null)}>
          <ListItemIcon>
            <WhatsAppIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share on WhatsApp</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => setShareAnchorEl(null)}>
          <ListItemIcon>
            <MessageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share via Message</ListItemText>
        </MenuItem>
      </Menu>

      {selectedQREvent && (
        <QRCodeDialog
          open={isQRDialogOpen}
          onClose={() => {
            setIsQRDialogOpen(false);
            setSelectedQREvent(null);
          }}
          eventUrl={`https://dropclip.app/events/${selectedQREvent.id}`}
        />
      )}
    </Container>
  );
};

export default EventsPage;
