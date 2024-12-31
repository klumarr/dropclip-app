import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  FormControl,
  InputLabel,
  Select,
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
import {
  ScrollSection,
  EventsRow,
  EventCard,
  EventCardMedia,
  EventCardContent,
  ActionButtonsContainer,
  ActionButton,
  UploadIndicator,
} from "../components/events/EventsPageStyles";
import FlyerScanner from "../components/events/FlyerScanner";
import SocialMediaHub from "../components/events/SocialMediaHub";
import ImageDialog from "../components/events/ImageDialog";
import { QRCodeSVG } from "qrcode.react";

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
      maxFileSize: 100, // 100MB default
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

  // Initialize with mock data
  useEffect(() => {
    setEvents({
      upcoming: [
        {
          id: "1",
          title: "Summer Festival 2024",
          date: "2024-07-15",
          location: "Central Park, NY",
          description: "Annual summer music festival featuring local artists",
          imageUrl: "https://example.com/event1.jpg",
        },
      ],
      past: [
        {
          id: "2",
          title: "Winter Concert 2023",
          date: "2023-12-20",
          location: "Madison Square Garden",
          description: "End of year special performance",
          imageUrl: "https://example.com/event2.jpg",
        },
      ],
      automatic: [
        {
          id: "3",
          title: "Club Performance",
          date: "2024-08-01",
          location: "Blue Note Jazz Club",
          description: "Found from Instagram post",
          imageUrl: "https://example.com/event3.jpg",
          isAutomatic: true,
        },
      ],
    });
  }, []);

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
          .split("T")[0], // 7 days from now
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

  const handleSaveEvent = () => {
    if (!formData.title || !formData.date || !formData.location) {
      // Show error or validation message
      return;
    }

    const eventToSave: Event = {
      id: selectedEvent?.id || Date.now().toString(),
      ...formData,
    };

    const eventDate = new Date(eventToSave.date);
    const now = new Date();
    const category = eventDate > now ? "upcoming" : "past";

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

        // Remove from old category
        const updatedEvents = {
          ...prev,
          [currentCategory]: prev[currentCategory].filter(
            (e) => e.id !== selectedEvent.id
          ),
        };

        // Add to new category
        return {
          ...updatedEvents,
          [category]: [...updatedEvents[category], eventToSave],
        };
      } else {
        // Add new event
        return {
          ...prev,
          [category]: [...prev[category], eventToSave],
        };
      }
    });

    setIsCreateDialogOpen(false);
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

    // Create object URL for preview
    const imageUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      imageUrl,
      imageFile: file,
    }));
  };

  const handleApproveAutoEvent = (event: Event) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    const category = eventDate > now ? "upcoming" : "past";

    // Add to appropriate category
    setEvents((prev) => ({
      ...prev,
      [category]: [...prev[category], { ...event, isAutomatic: false }],
      automatic: prev.automatic.filter((e) => e.id !== event.id),
    }));
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

    // Close the dialog but don't change the active tab
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

  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event);
    setIsDeleteConfirmOpen(true);
  };

  const handleShareClick = (
    event: React.MouseEvent<HTMLElement>,
    eventData: Event
  ) => {
    event.stopPropagation();
    setShareAnchorEl(event.currentTarget);
    setSelectedShareEvent(eventData);
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
    setSelectedShareEvent(null);
  };

  const handleShare = async (platform: string) => {
    if (!selectedShareEvent) return;

    const eventUrl = `${window.location.origin}/events/${selectedShareEvent.id}/upload`;
    const eventText = `Check out ${selectedShareEvent.title} at ${
      selectedShareEvent.location
    } on ${new Date(selectedShareEvent.date).toLocaleDateString()}`;

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            eventUrl
          )}`,
          "_blank"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            eventText
          )}&url=${encodeURIComponent(eventUrl)}`,
          "_blank"
        );
        break;
      case "instagram":
        alert("Copy the link to share on Instagram");
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            eventText + " " + eventUrl
          )}`,
          "_blank"
        );
        break;
      case "sms":
        window.open(
          `sms:?body=${encodeURIComponent(eventText + " " + eventUrl)}`,
          "_blank"
        );
        break;
      case "link":
        await navigator.clipboard.writeText(eventUrl);
        alert("Link copied to clipboard!");
        break;
      case "qr":
        setSelectedQREvent(selectedShareEvent);
        setIsQRDialogOpen(true);
        break;
    }
    handleShareClose();
  };

  const handleEventClick = (event: Event) => {
    if (activeTab === 1) {
      // Past events
      navigate(`/events/${event.id}/manage`);
    }
  };

  const renderPastEvents = () => (
    <ScrollSection>
      <EventsRow>
        {events.past.map((event) => (
          <EventCard key={event.id} onClick={() => handleEventClick(event)}>
            {event.imageUrl && (
              <EventCardMedia
                src={event.imageUrl || "/placeholder-event.jpg"}
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
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {new Date(event.date).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>
              {event.startTime && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {event.startTime} - {event.endTime}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {event.location}
              </Typography>
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", gap: 1 }}>
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
                      handleDeleteClick(event);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => handleShareClick(e, event)}
                  >
                    <ShareIcon />
                  </IconButton>
                </Box>
              </Box>
            </EventCardContent>
          </EventCard>
        ))}
      </EventsRow>
    </ScrollSection>
  );

  return (
    <Container
      maxWidth={false}
      sx={{
        p: 3,
        pb: 10,
        pt: 1,
        maxWidth: "1920px",
        mx: "auto",
        height: "calc(100vh - 64px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
          variant={isMobile ? "fullWidth" : "standard"}
        >
          <Tab label="Upcoming" />
          <Tab label="Past" />
          <Tab label="Automatic" />
        </Tabs>

        {activeTab === 0 && (
          <ScrollSection>
            <EventsRow>
              {events.upcoming.map((event) => (
                <EventCard key={event.id}>
                  {event.imageUrl && (
                    <EventCardMedia
                      src={event.imageUrl || "/placeholder-event.jpg"}
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
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      gutterBottom
                    >
                      {new Date(event.date).toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Typography>
                    {event.startTime && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {event.startTime} - {event.endTime}
                      </Typography>
                    )}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {event.location}
                    </Typography>
                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditEvent(event)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteEvent(event)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      {event.ticketLink && (
                        <Button
                          href={event.ticketLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          variant="outlined"
                        >
                          Get Tickets
                        </Button>
                      )}
                    </Box>
                  </EventCardContent>
                </EventCard>
              ))}
            </EventsRow>
          </ScrollSection>
        )}

        {activeTab === 1 && renderPastEvents()}

        {activeTab === 2 && (
          <ScrollSection>
            <EventsRow>
              {events.automatic.map((event) => (
                <EventCard key={event.id}>
                  {event.imageUrl && (
                    <EventCardMedia
                      src={event.imageUrl || "/placeholder-event.jpg"}
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
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      gutterBottom
                    >
                      {new Date(event.date).toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Typography>
                    {event.startTime && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {event.startTime} - {event.endTime}
                      </Typography>
                    )}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {event.location}
                    </Typography>
                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditEvent(event)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(event)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      {event.ticketLink && (
                        <Button
                          href={event.ticketLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          variant="outlined"
                        >
                          Get Tickets
                        </Button>
                      )}
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleApproveAutoEvent(event)}
                        sx={{ mr: 1 }}
                      >
                        Approve
                      </Button>
                    </Box>
                  </EventCardContent>
                </EventCard>
              ))}
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
      <ImageDialog
        open={isImageDialogOpen}
        onClose={() => setIsImageDialogOpen(false)}
        imageUrl={selectedImage}
      />
      <Dialog
        open={isFlyerScannerOpen}
        onClose={() => setIsFlyerScannerOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Scan Event Flyer</DialogTitle>
        <DialogContent>
          <FlyerScanner
            onEventDetected={handleEventDetected}
            onClose={() => setIsFlyerScannerOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isSocialHubOpen}
        onClose={() => setIsSocialHubOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Social Media Integration</DialogTitle>
        <DialogContent>
          <SocialMediaHub onEventImported={handleSocialEventImported} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSocialHubOpen(false)}>Close</Button>
        </DialogActions>
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
                  error={!formData.title}
                  helperText={!formData.title && "Title is required"}
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
                  error={!formData.date}
                  helperText={!formData.date && "Date is required"}
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
                  error={!formData.location}
                  helperText={!formData.location && "Location is required"}
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
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  id="event-flyer-upload"
                  onChange={handleFlyerUpload}
                />
                <label htmlFor="event-flyer-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCameraIcon />}
                  >
                    Upload Flyer
                  </Button>
                </label>
                {formData.imageUrl && (
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={formData.imageUrl}
                      alt="Event flyer preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: 200,
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                )}
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
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
                <Typography variant="subtitle1" gutterBottom>
                  Fan Upload Settings
                </Typography>
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
                  label="Enable fan uploads"
                />
              </Grid>
              {formData.uploadConfig.enabled && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Upload Start Date"
                      value={formData.uploadConfig.startDate || ""}
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
                      value={formData.uploadConfig.endDate || ""}
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
                      label="Daily Upload Start Time"
                      value={formData.uploadConfig.startTime || ""}
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
                      label="Daily Upload End Time"
                      value={formData.uploadConfig.endTime || ""}
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
                      value={formData.uploadConfig.maxFileSize || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          uploadConfig: {
                            ...prev.uploadConfig,
                            maxFileSize: Number(e.target.value),
                          },
                        }))
                      }
                      InputProps={{
                        inputProps: { min: 1, max: 1000 },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Allowed File Types</InputLabel>
                      <Select
                        multiple
                        value={formData.uploadConfig.allowedTypes || []}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            uploadConfig: {
                              ...prev.uploadConfig,
                              allowedTypes: e.target.value as string[],
                            },
                          }))
                        }
                        renderValue={(selected) =>
                          (selected as string[]).join(", ")
                        }
                      >
                        <MenuItem value="image/*">Images</MenuItem>
                        <MenuItem value="video/*">Videos</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEvent}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete Event</DialogTitle>
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

      {/* Share Menu */}
      <Menu
        anchorEl={shareAnchorEl}
        open={Boolean(shareAnchorEl)}
        onClose={handleShareClose}
      >
        <MenuItem onClick={() => handleShare("facebook")}>
          <ListItemIcon>
            <FacebookIcon />
          </ListItemIcon>
          <ListItemText>Facebook</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShare("twitter")}>
          <ListItemIcon>
            <TwitterIcon />
          </ListItemIcon>
          <ListItemText>Twitter</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShare("instagram")}>
          <ListItemIcon>
            <InstagramIcon />
          </ListItemIcon>
          <ListItemText>Instagram</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShare("whatsapp")}>
          <ListItemIcon>
            <WhatsAppIcon />
          </ListItemIcon>
          <ListItemText>WhatsApp</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShare("sms")}>
          <ListItemIcon>
            <MessageIcon />
          </ListItemIcon>
          <ListItemText>SMS</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShare("link")}>
          <ListItemIcon>
            <LinkIcon />
          </ListItemIcon>
          <ListItemText>Copy Link</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShare("qr")}>
          <ListItemIcon>
            <QrCodeIcon />
          </ListItemIcon>
          <ListItemText>QR Code</ListItemText>
        </MenuItem>
      </Menu>

      <QRCodeDialog
        open={isQRDialogOpen}
        onClose={() => {
          setIsQRDialogOpen(false);
          setSelectedQREvent(null);
        }}
        eventUrl={
          selectedQREvent
            ? `${window.location.origin}/events/${selectedQREvent.id}/upload`
            : ""
        }
      />
    </Container>
  );
};

export default EventsPage;
