import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  VideoLibrary as VideoIcon,
  Link as LinkIcon,
} from "@mui/icons-material";
import {
  EventCard as StyledEventCard,
  EventCardMedia,
  EventCardContent,
  EventStatusIndicator,
  ActionButtonsWrapper,
} from "../creative/EventsPageStyles";
import { Event } from "../../../types/events";
import ShareMenu from "../creative/EventActions/ShareMenu";

interface EventCardProps {
  event: Event;
  onEdit: () => void;
  onDelete: () => void;
  onShare: (event: Event) => Promise<void>;
  isPast?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onEdit,
  onDelete,
  onShare,
  isPast = false,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = React.useState(false);

  const handleShareClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      onDelete();
    }
  };

  const handleImageClick = () => {
    setIsImageDialogOpen(true);
  };

  const getLocationString = (event: Event) => {
    return [event.venue, event.city, event.country].filter(Boolean).join(", ");
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <StyledEventCard>
        <EventStatusIndicator isPast={isPast}>
          {isPast ? "Past" : "Upcoming"}
        </EventStatusIndicator>

        {event.flyerUrl && (
          <EventCardMedia
            src={event.flyerUrl}
            alt={event.name}
            onClick={handleImageClick}
            style={{ cursor: "pointer" }}
          />
        )}

        <EventCardContent>
          <Box sx={{ mb: 1 }}>
            {event.type && (
              <Chip
                label={event.type}
                size="small"
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "#fff",
                  mb: 1,
                }}
              />
            )}
          </Box>

          <Typography variant="h6" gutterBottom>
            {event.name}
          </Typography>

          <Typography variant="body1" gutterBottom>
            {formatDate(event.date)}
          </Typography>

          {event.time && (
            <Typography variant="body2" gutterBottom>
              {event.time} {event.endTime && `- ${event.endTime}`}
            </Typography>
          )}

          <Typography variant="body2" gutterBottom>
            {getLocationString(event)}
          </Typography>

          {event.description && (
            <Typography
              variant="body2"
              gutterBottom
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {event.description}
            </Typography>
          )}

          <ActionButtonsWrapper>
            {!isPast && (
              <IconButton size="small" onClick={onEdit} title="Edit event">
                <EditIcon />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={handleShareClick}
              title="Share event"
            >
              <ShareIcon />
            </IconButton>
            {isPast && (
              <>
                <IconButton
                  size="small"
                  onClick={() => {
                    console.log(
                      "Navigate to video management for event:",
                      event.id
                    );
                  }}
                  title="View videos"
                >
                  <VideoIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    console.log(
                      "Navigate to fan upload page for event:",
                      event.id
                    );
                  }}
                  title="Share upload link"
                >
                  <LinkIcon />
                </IconButton>
              </>
            )}
            {!isPast && (
              <IconButton
                size="small"
                onClick={handleDelete}
                color="error"
                title="Delete event"
              >
                <DeleteIcon />
              </IconButton>
            )}
          </ActionButtonsWrapper>
        </EventCardContent>

        <ShareMenu
          event={event}
          anchorEl={anchorEl}
          onClose={handleShareClose}
          onShare={onShare}
          open={Boolean(anchorEl)}
        />
      </StyledEventCard>

      <Dialog
        open={isImageDialogOpen}
        onClose={() => setIsImageDialogOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: "transparent",
            boxShadow: "none",
            margin: 0,
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: "relative" }}>
          <img
            src={event.flyerUrl}
            alt={event.name}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "90vh",
              objectFit: "contain",
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventCard;
