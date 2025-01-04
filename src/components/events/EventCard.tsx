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
} from "./EventsPageStyles";

interface Event {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location: string;
  description: string;
  imageUrl?: string;
  ticketLink?: string;
  isAutomatic?: boolean;
  uploadConfig?: {
    enabled: boolean;
    allowedTypes: string[];
    maxFileSize: number;
  };
}

interface EventCardProps {
  event: Event;
  onEdit: () => void;
  onDelete: () => void;
  onShare: (e: React.MouseEvent<HTMLElement>) => void;
  isPast?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onEdit,
  onDelete,
  onShare,
  isPast = false,
}) => {
  const handleClick = (
    e: React.MouseEvent<HTMLElement>,
    action: (e: React.MouseEvent<HTMLElement>) => void
  ) => {
    e.stopPropagation();
    action(e);
  };

  return (
    <StyledEventCard
      sx={{
        opacity: isPast ? 0.7 : 1,
      }}
    >
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
        <Box
          sx={{
            display: "flex",
            gap: 1,
            mt: 2,
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              size="small"
              onClick={(e) => handleClick(e, () => onEdit())}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => handleClick(e, () => onDelete())}
            >
              <DeleteIcon />
            </IconButton>
            <IconButton size="small" onClick={(e) => handleClick(e, onShare)}>
              <ShareIcon />
            </IconButton>
          </Box>
          {event.uploadConfig?.enabled && (
            <Typography variant="caption" color="text.secondary">
              Uploads Enabled
            </Typography>
          )}
        </Box>
      </EventCardContent>
    </StyledEventCard>
  );
};

export default EventCard;
