import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useEvents } from "../../contexts/EventsContext";
import { Event } from "../../types/events";
import { SharePlatform } from "../../types/share";
import { trackEventShare } from "../../services/analyticsService";
import useSaveEvent from "../../hooks/useSaveEvent";
import {
  Typography,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Divider,
  Stack,
  Box,
  Dialog,
  Snackbar,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonIcon from "@mui/icons-material/Person";
import LocationIcon from "@mui/icons-material/LocationOn";
import CategoryIcon from "@mui/icons-material/Category";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { format } from "date-fns";
import ShareMenu from "../../components/events/creative/EventActions/ShareMenu";
import {
  PreviewContainer,
  HeroSection,
  HeroImage,
  ContentSection,
  ActionBar,
  CreativeSectionContainer,
  StatsItem,
  UpcomingEventsList,
} from "./EventPreviewPage.styles";
import { useAuth } from "../../contexts/AuthContext";
import { followService } from "../../services/follow.service";
import { eventOperations } from "../../services/eventsService";
import AuthModal from "../../components/auth/AuthModal";

export const EventPreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getPublicEvent } = useEvents();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [shareAnchorEl, setShareAnchorEl] = useState<null | HTMLElement>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [pendingAction, setPendingAction] = useState<"save" | "follow" | null>(
    null
  );

  const {
    isSaved,
    isLoading: isSaving,
    error: saveError,
    toggleSave,
  } = useSaveEvent(id || "");

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) {
        setError("Event ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("EventPreviewPage - Fetching event:", id);
        const eventData = await getPublicEvent(id);

        if (!eventData) {
          console.log("EventPreviewPage - Event not found:", id);
          setError("Event not found");
          return;
        }

        console.log("EventPreviewPage - Event loaded successfully:", eventData);
        setEvent(eventData);
      } catch (error) {
        console.error("EventPreviewPage - Error loading event:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load event"
        );
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id, getPublicEvent]);

  const handleImageClick = () => {
    if (event?.flyerUrl) {
      setImageDialogOpen(true);
    }
  };

  const handleShareClick = (event: React.MouseEvent<HTMLElement>) => {
    setShareAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
  };

  const handleShare = async (
    eventToShare: Event,
    platform: SharePlatform
  ): Promise<void> => {
    try {
      await trackEventShare(eventToShare, platform);
      console.log("EventPreviewPage - Sharing event:", {
        eventToShare,
        platform,
      });
    } catch (error) {
      console.error("EventPreviewPage - Error sharing event:", error);
      setShareError("Failed to share event. Please try again.");
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (pendingAction === "save") {
      handleSave();
    } else if (pendingAction === "follow" && event) {
      const creativeSection = document.querySelector(
        ".creative-header button"
      ) as HTMLButtonElement;
      if (creativeSection) {
        creativeSection.click();
      }
    }
    setPendingAction(null);
  };

  const handleSave = async () => {
    if (!user) {
      setAuthMessage("Sign in to save this event to your favorites");
      setPendingAction("save");
      setShowAuthModal(true);
      return;
    }

    try {
      await toggleSave(event);
      console.log("EventPreviewPage - Event saved/unsaved successfully");
    } catch (error) {
      console.error("EventPreviewPage - Error saving event:", error);
    }
  };

  const formatEventTime = (timeStr: string): string => {
    try {
      // Create a date object with today's date and the time string
      const [hours, minutes] = timeStr.split(":").map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);

      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeStr;
    }
  };

  const CreativeProfileSection: React.FC = () => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);

    useEffect(() => {
      const checkFollowStatus = async () => {
        if (user?.id && event?.creativeId) {
          try {
            const status = await followService.checkFollowStatus(
              user.id,
              event.creativeId
            );
            setIsFollowing(status);
          } catch (error) {
            console.error("Error checking follow status:", error);
          }
        }
      };

      const fetchUpcomingEvents = async () => {
        if (event?.creativeId) {
          setIsLoadingEvents(true);
          try {
            const events = await eventOperations.listEvents(event.creativeId);
            const upcoming = events
              .filter((e) => new Date(e.date) > new Date() && e.id !== event.id)
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
              )
              .slice(0, 3);
            setUpcomingEvents(upcoming);
          } catch (error) {
            console.error("Error fetching upcoming events:", error);
          } finally {
            setIsLoadingEvents(false);
          }
        }
      };

      checkFollowStatus();
      fetchUpcomingEvents();
    }, [user?.id, event?.creativeId]);

    const handleFollowClick = async () => {
      if (!user) {
        setAuthMessage("Sign in to follow this creative");
        setPendingAction("follow");
        setShowAuthModal(true);
        return;
      }

      if (!event?.creativeId) {
        console.error("No creative ID available");
        return;
      }

      try {
        if (isFollowing) {
          await followService.unfollowCreative(user.id, event.creativeId);
        } else {
          await followService.followCreative(user.id, event.creativeId);
        }
        setIsFollowing(!isFollowing);
        console.log(`${isFollowing ? "Unfollowed" : "Followed"} creative`);
      } catch (error) {
        console.error("Error following/unfollowing creative:", error);
      }
    };

    return (
      <CreativeSectionContainer>
        <div className="creative-header">
          <Avatar src={event?.creativePhotoUrl} alt={event?.creativeName} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">{event?.creativeName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {event?.creativeType}
            </Typography>
          </Box>
          <Button
            variant={isFollowing ? "outlined" : "contained"}
            color="primary"
            startIcon={isFollowing ? <PersonIcon /> : <PersonAddIcon />}
            onClick={handleFollowClick}
          >
            {isFollowing ? "Following" : "Follow"}
          </Button>
        </div>

        {upcomingEvents.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Upcoming Events
            </Typography>
            <UpcomingEventsList>
              {upcomingEvents.map((upcomingEvent) => (
                <Box key={upcomingEvent.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">
                    {upcomingEvent.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {format(new Date(upcomingEvent.date), "EEEE, MMMM d, yyyy")}{" "}
                    at {formatEventTime(upcomingEvent.time)}
                  </Typography>
                </Box>
              ))}
            </UpcomingEventsList>
          </Box>
        )}
      </CreativeSectionContainer>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !event) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error || "Event not found"}</Alert>
      </Box>
    );
  }

  return (
    <PreviewContainer>
      <HeroSection>
        <HeroImage
          src={event.flyerUrl || "/default-event-image.jpg"}
          alt={event.name}
          onClick={handleImageClick}
        />
      </HeroSection>

      <ContentSection>
        <Typography variant="h4" gutterBottom>
          {event.name || "Love Beyond The Shell"}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {format(new Date(event.date), "EEEE, MMMM d, yyyy")} at{" "}
          {formatEventTime(event.time)}
        </Typography>

        {event.description && (
          <Box sx={{ my: 2 }}>
            <Typography variant="h6" gutterBottom>
              About This Event
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {event.description}
            </Typography>
          </Box>
        )}

        <Box sx={{ my: 2 }}>
          <Typography variant="h6" gutterBottom>
            Event Details
          </Typography>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LocationIcon color="action" />
              <Typography variant="body1">
                {event.venue}
                {event.city && `, ${event.city}`}
                {event.country && `, ${event.country}`}
              </Typography>
            </Box>
            {event.type && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CategoryIcon color="action" />
                <Typography variant="body1">{event.type}</Typography>
              </Box>
            )}
          </Stack>
        </Box>

        <ActionBar>
          <IconButton aria-label="share event" onClick={handleShareClick}>
            <ShareIcon />
          </IconButton>
          <Button
            variant={isSaved ? "outlined" : "contained"}
            color="primary"
            startIcon={<BookmarkBorderIcon />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : isSaved ? "Saved" : "Save"}
          </Button>
        </ActionBar>

        <Divider sx={{ my: 2 }} />

        <CreativeProfileSection />

        {!user && (
          <Box
            sx={{
              mt: 4,
              p: 3,
              borderRadius: 2,
              background: "linear-gradient(135deg, #6B46C1 0%, #9F7AEA 100%)",
              boxShadow: "0 4px 6px rgba(107, 70, 193, 0.2)",
            }}
          >
            <Typography variant="h6" gutterBottom color="white">
              Join DropClip
            </Typography>
            <Typography variant="body1" color="white" paragraph>
              Connect with your favorite performers, discover events, and share
              your best moments. Join our community to:
            </Typography>
            <List sx={{ color: "white" }}>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon sx={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="Share your event recordings directly with artists" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon sx={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="Discover and follow your favorite performers" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon sx={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="Access exclusive content from followed artists" />
              </ListItem>
            </List>
            <Button
              variant="contained"
              size="large"
              fullWidth
              component={Link}
              to="/auth/signup"
              sx={{
                mt: 2,
                bgcolor: "#6B46C1",
                color: "white",
                "&:hover": {
                  bgcolor: "#553C9A",
                },
              }}
            >
              Join DropClip Now
            </Button>
          </Box>
        )}
      </ContentSection>

      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <img
          src={event.flyerUrl}
          alt={event.title}
          style={{ width: "100%", height: "auto" }}
        />
      </Dialog>

      <ShareMenu
        event={event}
        open={Boolean(shareAnchorEl)}
        anchorEl={shareAnchorEl}
        onClose={handleShareClose}
        onShare={handleShare}
      />

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        message={authMessage}
      />

      <Snackbar
        open={!!shareError}
        autoHideDuration={6000}
        onClose={() => setShareError(null)}
      >
        <Alert severity="error" onClose={() => setShareError(null)}>
          {shareError}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!saveError}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {saveError}
        </Alert>
      </Snackbar>
    </PreviewContainer>
  );
};

export default EventPreviewPage;
