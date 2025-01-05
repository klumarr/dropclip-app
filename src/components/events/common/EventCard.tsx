import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
} from "@mui/icons-material";
import {
  EventCard as StyledEventCard,
  EventCardMedia,
  EventCardContent,
} from "../creative/EventsPageStyles";
import { Event } from "../../../types/events";
import { useEventActions } from "../../../hooks/useEventActions";
import ShareMenu from "../creative/EventActions/ShareMenu";

interface EventCardProps {
  event: Event;
  onEdit: () => void;
  onDelete: () => void;
  isPast?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onEdit,
  onDelete,
  isPast = false,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { handleShare } = useEventActions();

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

  return (
    <StyledEventCard sx={{ opacity: isPast ? 0.7 : 1 }}>
      {event.imageUrl && (
        <EventCardMedia src={event.imageUrl} alt={event.title} />
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
        {event.description && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {event.description}
          </Typography>
        )}
        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          <IconButton size="small" onClick={onEdit}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={handleShareClick}>
            <ShareIcon />
          </IconButton>
          <IconButton size="small" onClick={handleDelete} color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      </EventCardContent>

      <ShareMenu
        event={event}
        anchorEl={anchorEl}
        onClose={handleShareClose}
        onShare={handleShare}
      />
    </StyledEventCard>
  );
};

export default EventCard;
