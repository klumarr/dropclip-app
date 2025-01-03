import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
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
}

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
        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          <IconButton size="small" onClick={onEdit}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </EventCardContent>
    </StyledEventCard>
  );
};

export default EventCard;
