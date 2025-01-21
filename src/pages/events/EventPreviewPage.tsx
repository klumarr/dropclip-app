import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useEvents } from "../../contexts/EventsContext";
import { Event } from "../../types/events";
import { SharePlatform } from "../../types/share";
import { trackEventShare } from "../../services/analyticsService";
import { useSaveEvent } from "../../hooks/useSaveEvent";
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
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const {
    isSaved,
    isLoading: isSaving,
    error: saveError,
    toggleSave,
  } = useSaveEvent(id || "");

  const handleFollowClick = async (e?: React.MouseEvent<HTMLElement>) => {
    e?.stopPropagation();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (!event) {
      console.error("No event to follow creative");
      return;
    }

    try {
      if (isFollowing) {
        await followService.unfollowCreative(event.creativeId);
        setIsFollowing(false);
      } else {
        await followService.followCreative(event.creativeId);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
    }
  };

  useEffect(() => {
    const fetchEventData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        console.log("EventPreviewPage - Fetching event data for ID:", id);
        const fetchedEvent = await getPublicEvent(id);

        if (fetchedEvent) {
          console.log(
            "EventPreviewPage - Successfully fetched event with creative data:",
            fetchedEvent
          );
          setEvent(fetchedEvent);
        } else {
          console.log("EventPreviewPage - No event found for ID:", id);
          setError("Event not found");
        }
      } catch (err) {
        console.error("EventPreviewPage - Error fetching event:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch event details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
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
    if (pendingAction === "save" && event) {
      handleSave();
    } else if (pendingAction === "follow" && event) {
      handleFollowClick();
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

    if (!event) {
      console.error("No event to save");
      return;
    }

    try {
      await toggleSave(event);
      console.log("EventPreviewPage - Event saved/unsaved successfully");
    } catch (error) {
      console.error("EventPreviewPage - Error saving event:", error);
    }
  };

  const handleCreativeClick = () => {
    if (event?.creativeId) {
      navigate(`/profile/${event.creativeId}`);
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

  const CreativeProfileSection: React.FC<{ event: Event }> = ({ event }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const handleProfileClick = () => {
      if (event.creativeId) {
        navigate(`/profile/${event.creativeId}`);
      }
    };

    const handleFollowClick = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!user) {
        setShowAuthModal(true);
        return;
      }
      // ... rest of follow logic ...
    };

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: 2,
          marginBottom: 2,
          backgroundColor: "background.paper",
          borderRadius: 1,
          boxShadow: 1,
          cursor: "pointer",
          "&:hover": {
            boxShadow: 3,
            backgroundColor: "action.hover",
          },
        }}
        onClick={handleProfileClick}
      >
        <Avatar
          src={event.creativePhotoUrl || undefined}
          alt={event.creativeName || "Creative"}
          sx={{
            width: 64,
            height: 64,
            marginRight: 2,
            border: 2,
            borderColor: "primary.main",
          }}
        />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="div">
            {event.creativeName || "Anonymous Creative"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {event.creativeType || "Creative"}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleFollowClick}
          sx={{
            minWidth: 100,
            "&:hover": {
              backgroundColor: "primary.main",
              color: "common.white",
            },
          }}
        >
          {isFollowing ? "Following" : "Follow"}
        </Button>
        <AuthModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          message="Sign in to follow this creative"
          onSuccess={handleAuthSuccess}
        />
      </Box>
    );
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!event) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Alert severity="info">Event not found</Alert>
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
        <CreativeProfileSection event={event} />

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
              Join DropClip - Share Your Best Moments in Full Quality
            </Typography>
            <Typography variant="body1" color="white" paragraph>
              Experience the difference with DropClip's uncompressed video
              sharing. Connect with your favorite performers and share your
              event recordings in their original, pristine quality. Join our
              community to:
            </Typography>
            <List sx={{ color: "white" }}>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon sx={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="Share full high-quality videos directly with artists - no compression, no quality loss" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon sx={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="Maintain original video resolution and frame rate - perfect for high-energy performances" />
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
        message={authMessage}
        onSuccess={handleAuthSuccess}
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
