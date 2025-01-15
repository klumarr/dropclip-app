import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
} from "@mui/material";
import {
  Share as ShareIcon,
  VideoLibrary as VideoIcon,
  Link as LinkIcon,
} from "@mui/icons-material";
import {
  EventCard as StyledEventCard,
  EventCardMedia,
  EventCardContent,
} from "../creative/EventsPageStyles";
import { Event } from "../../../types/events";
import { useEventActions } from "../../../hooks/useEventActions";
import ShareMenu from "../creative/EventActions/ShareMenu";

interface FanEventCardProps {
  event: Event;
  isPast?: boolean;
}

const FanEventCard: React.FC<FanEventCardProps> = ({
  event,
  isPast = false,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = React.useState(false);
  const { handleShare } = useEventActions();

  const handleShareClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setAnchorEl(null);
  };

  const handleImageClick = () => {
    setIsImageDialogOpen(true);
  };

  const getLocationString = (event: Event) => {
    const parts = [event.venue, event.city, event.country].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <>
      <StyledEventCard sx={{ opacity: isPast ? 0.7 : 1 }}>
        {event.flyerUrl && (
          <EventCardMedia
            src={event.flyerUrl}
            alt={event.name}
            onClick={handleImageClick}
            style={{ cursor: "pointer" }}
          />
        )}
        <EventCardContent>
          <Typography variant="h6" gutterBottom>
            {event.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {new Date(event.date).toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Typography>
          {event.time && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {event.time} - {event.endTime}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {getLocationString(event)}
          </Typography>
          {event.description && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {event.description}
            </Typography>
          )}
          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            <IconButton size="small" onClick={handleShareClick}>
              <ShareIcon />
            </IconButton>
            {isPast && (
              <>
                <IconButton
                  size="small"
                  onClick={() => {
                    console.log(
                      "Navigate to video gallery for event:",
                      event.id
                    );
                  }}
                >
                  <VideoIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    console.log("Navigate to upload page for event:", event.id);
                  }}
                >
                  <LinkIcon />
                </IconButton>
              </>
            )}
          </Box>
        </EventCardContent>

        <ShareMenu
          event={event}
          anchorEl={anchorEl}
          onClose={handleShareClose}
          onShare={handleShare}
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

export default FanEventCard;
