import React from "react";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  styled,
  Button,
} from "@mui/material";
import {
  LocationOn as LocationIcon,
  BookmarkBorder as SaveIcon,
  Bookmark as SavedIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Event } from "../../types/events.types";
import { useSaveEvent } from "../../hooks/useSaveEvent";
import { useAuth } from "../../contexts/AuthContext";

const ScrollContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  overflowX: "auto",
  gap: theme.spacing(2),
  padding: theme.spacing(1),
  "&::-webkit-scrollbar": {
    height: 6,
  },
  "&::-webkit-scrollbar-track": {
    background: theme.palette.grey[200],
    borderRadius: 3,
  },
  "&::-webkit-scrollbar-thumb": {
    background: theme.palette.grey[400],
    borderRadius: 3,
    "&:hover": {
      background: theme.palette.grey[500],
    },
  },
}));

const EventCard = styled(Card)(({ theme }) => ({
  minWidth: 280,
  maxWidth: 280,
  cursor: "pointer",
  transition: "transform 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
  },
}));

const EventInfo = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

interface UpcomingEventsTimelineProps {
  events: Event[];
}

const formatEventTime = (time: string) => {
  try {
    const [hours, minutes] = time.split(":").map(Number);
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
    return time;
  }
};

export const UpcomingEventsTimeline: React.FC<UpcomingEventsTimelineProps> = ({
  events,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  if (!events.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        No upcoming events
      </Typography>
    );
  }

  const SaveEventButton = ({ event }: { event: Event }) => {
    const { isSaved, toggleSave } = useSaveEvent(event.id);

    const handleSaveClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleSave(event);
    };

    return (
      <IconButton size="small" onClick={handleSaveClick} sx={{ ml: 1 }}>
        {isSaved ? <SavedIcon color="primary" /> : <SaveIcon />}
      </IconButton>
    );
  };

  return (
    <ScrollContainer>
      {events.map((event) => (
        <EventCard key={event.id} onClick={() => handleEventClick(event.id)}>
          <CardMedia
            component="img"
            height="140"
            image={event.flyerUrl || "/placeholder-event.jpg"}
            alt={event.title}
          />
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Typography variant="h6" noWrap sx={{ flex: 1 }}>
                {event.title}
              </Typography>
              {user && <SaveEventButton event={event} />}
            </Box>

            <EventInfo>
              <TimeIcon fontSize="small" />
              <Typography variant="body2" noWrap>
                {new Date(event.date).toLocaleDateString()} at{" "}
                {formatEventTime(event.time)}
              </Typography>
            </EventInfo>

            <EventInfo>
              <LocationIcon fontSize="small" />
              <Typography variant="body2" noWrap>
                {event.venue}
                {event.city && `, ${event.city}`}
              </Typography>
            </EventInfo>

            {!user && (
              <Box sx={{ mt: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/events/${event.id}`);
                  }}
                >
                  View Details
                </Button>
              </Box>
            )}
          </CardContent>
        </EventCard>
      ))}
    </ScrollContainer>
  );
};
