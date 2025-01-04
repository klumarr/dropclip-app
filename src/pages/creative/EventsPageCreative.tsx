import { useState, useEffect } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import {
  Box,
  CircularProgress,
  Container,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import {
  ContentCopy,
  Facebook,
  Twitter,
  Instagram,
  QrCode,
  WhatsApp,
  Email,
  Sms,
} from "@mui/icons-material";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../../contexts/AuthContext";
import EventCard from "../../components/events/EventCard";
import {
  ScrollSection,
  EventsRow,
} from "../../components/events/EventsPageStyles";
import { eventOperations, Event } from "../../services/eventsService";

interface CategorizedEvents {
  upcoming: Event[];
  past: Event[];
  automatic: Event[];
}

const EventsPageCreative: React.FC = () => {
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
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [shareAnchorEl, setShareAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedShareEvent, setSelectedShareEvent] = useState<Event | null>(
    null
  );
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<Omit<Event, "id" | "user_id">>({
    title: "",
    date: new Date().toISOString().split("T")[0],
    location: "",
    description: "",
    isAutomatic: false,
  });

  const fetchEvents = async () => {
    if (!user) {
      console.log("No user found, skipping fetch");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching events for user:", user.id);

      const eventsData = await eventOperations.getCreativeEvents();
      console.log("Fetched events:", eventsData);

      const sortByDate = (a: Event, b: Event) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      };

      const now = new Date();
      const categorizedEvents = eventsData.reduce<CategorizedEvents>(
        (acc, event) => {
          const eventDate = new Date(event.date);
          if (event.isAutomatic) {
            acc.automatic.push(event);
          } else if (eventDate >= now) {
            acc.upcoming.push(event);
          } else {
            acc.past.push(event);
          }
          return acc;
        },
        { upcoming: [], past: [], automatic: [] }
      );

      categorizedEvents.upcoming.sort(sortByDate);
      categorizedEvents.past.sort(sortByDate);
      categorizedEvents.automatic.sort(sortByDate);

      setEvents(categorizedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch events"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const handleEditClick = (event: Event) => {
    console.log("Opening edit dialog for event:", event);
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      location: event.location,
      description: event.description,
      isAutomatic: event.isAutomatic || false,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!selectedEvent) return;

    try {
      console.log("Saving edited event:", {
        eventId: selectedEvent.id,
        formData,
      });

      await eventOperations.updateEvent(selectedEvent.id, formData);
      console.log("Event updated successfully");

      setIsEditDialogOpen(false);
      setSelectedEvent(null);

      // Refresh the events list
      await fetchEvents();
    } catch (error) {
      console.error("Error updating event:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update event"
      );
    }
  };

  const handleDeleteClick = (event: Event) => {
    console.log("Opening delete confirmation for event:", event);
    setEventToDelete(event);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;

    try {
      console.log("Deleting event:", eventToDelete);
      await eventOperations.deleteEvent(eventToDelete.id);
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
      await fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete event"
      );
    }
  };

  const handleShareEvent = (event: Event, anchorEl: HTMLElement) => {
    setSelectedShareEvent(event);
    setShareAnchorEl(anchorEl);
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
  };

  const getEventShareUrl = (event: Event) => {
    return `${window.location.origin}/events/${event.id}`;
  };

  const handleCopyLink = async () => {
    if (!selectedShareEvent) return;
    try {
      await navigator.clipboard.writeText(getEventShareUrl(selectedShareEvent));
      setShareMessage({
        type: "success",
        message: "Link copied to clipboard!",
      });
    } catch (error) {
      setShareMessage({ type: "error", message: "Failed to copy link" });
    }
    handleShareClose();
  };

  const handleSocialShare = (platform: string) => {
    if (!selectedShareEvent) return;
    const shareUrl = getEventShareUrl(selectedShareEvent);
    const eventDate = new Date(selectedShareEvent.date).toLocaleDateString(
      undefined,
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    const messages = {
      facebook: `Check out this event: ${selectedShareEvent.title}`,
      twitter: `Join me at ${selectedShareEvent.title} on ${eventDate} at ${selectedShareEvent.location}! 🎉`,
      whatsapp: `Hey! I wanted to invite you to ${selectedShareEvent.title} on ${eventDate} at ${selectedShareEvent.location}. Hope you can make it! 🎉`,
      email: `Hi!\n\nI wanted to invite you to an exciting event:\n\n${
        selectedShareEvent.title
      }\nDate: ${eventDate}\nLocation: ${selectedShareEvent.location}\n\n${
        selectedShareEvent.description || ""
      }\n\nHope you can make it!\n\nBest regards`,
      sms: `Join me at ${selectedShareEvent.title} on ${eventDate} at ${selectedShareEvent.location}! Details here:`,
    };

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        messages.twitter
      )}&url=${shareUrl}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(
        messages.whatsapp + " " + shareUrl
      )}`,
      email: `mailto:?subject=${encodeURIComponent(
        selectedShareEvent.title
      )}&body=${encodeURIComponent(messages.email + "\n\n" + shareUrl)}`,
      sms: `sms:?&body=${encodeURIComponent(messages.sms + " " + shareUrl)}`,
    };

    window.open(urls[platform as keyof typeof urls], "_blank");
    handleShareClose();
  };

  const handleShowQR = () => {
    setIsQRDialogOpen(true);
    handleShareClose();
  };

  const renderEventCard = (
    event: Event,
    isPast: boolean = false
  ): JSX.Element => (
    <EventCard
      key={event.id}
      event={event}
      onEdit={() => handleEditClick(event)}
      onDelete={() => handleDeleteClick(event)}
      onShare={(e: React.MouseEvent<HTMLElement>) =>
        handleShareEvent(event, e.currentTarget)
      }
      isPast={isPast}
    />
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        {error && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              bgcolor: "error.main",
              color: "error.contrastText",
              borderRadius: 1,
            }}
          >
            {error}
          </Box>
        )}

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
              {events.upcoming.map((event) => renderEventCard(event))}
            </EventsRow>
          </ScrollSection>
        )}

        {activeTab === 1 && (
          <ScrollSection>
            <EventsRow>
              {events.past.map((event) => renderEventCard(event, true))}
            </EventsRow>
          </ScrollSection>
        )}

        {activeTab === 2 && (
          <ScrollSection>
            <EventsRow>
              {events.automatic.map((event) => renderEventCard(event))}
            </EventsRow>
          </ScrollSection>
        )}
      </Box>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
            <TextField
              fullWidth
              type="date"
              label="Date"
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this event?
            {eventToDelete && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {eventToDelete.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: {new Date(eventToDelete.date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Location: {eventToDelete.location}
                </Typography>
              </Box>
            )}
          </Typography>
          <Typography color="error" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
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
        <MenuItem onClick={handleCopyLink}>
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Link</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSocialShare("facebook")}>
          <ListItemIcon>
            <Facebook fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share on Facebook</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSocialShare("twitter")}>
          <ListItemIcon>
            <Twitter fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share on Twitter</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSocialShare("instagram")}>
          <ListItemIcon>
            <Instagram fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share on Instagram</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSocialShare("whatsapp")}>
          <ListItemIcon>
            <WhatsApp fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share on WhatsApp</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSocialShare("email")}>
          <ListItemIcon>
            <Email fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share via Email</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSocialShare("sms")}>
          <ListItemIcon>
            <Sms fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share via SMS</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleShowQR}>
          <ListItemIcon>
            <QrCode fontSize="small" />
          </ListItemIcon>
          <ListItemText>Show QR Code</ListItemText>
        </MenuItem>
      </Menu>

      {/* QR Code Dialog */}
      <Dialog
        open={isQRDialogOpen}
        onClose={() => setIsQRDialogOpen(false)}
        maxWidth="sm"
      >
        <DialogTitle>Event QR Code</DialogTitle>
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
            {selectedShareEvent && (
              <>
                <QRCodeSVG
                  value={getEventShareUrl(selectedShareEvent)}
                  size={256}
                  level="H"
                />
                <Typography variant="body2" align="center">
                  Scan this QR code to view the event details
                </Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsQRDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Message Snackbar */}
      <Snackbar
        open={!!shareMessage}
        autoHideDuration={3000}
        onClose={() => setShareMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {shareMessage && (
          <Alert
            onClose={() => setShareMessage(null)}
            severity={shareMessage.type}
            sx={{ width: "100%" }}
          >
            {shareMessage.message}
          </Alert>
        )}
      </Snackbar>
    </Container>
  );
};

export default EventsPageCreative;
