import React from "react";
import { Typography } from "@mui/material";
import EventCard from "../../common/EventCard";
import { EventsGridProps } from "./types";
import { ScrollSection, EventsRow } from "../EventsPageStyles";

const EventsGrid: React.FC<EventsGridProps> = ({
  events,
  onEdit,
  onDelete,
  emptyMessage,
}) => {
  if (events.length === 0) {
    return (
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ textAlign: "center", py: 4 }}
      >
        {emptyMessage}
      </Typography>
    );
  }

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    const now = Date.now();
    const isPastA = dateA < now;
    const isPastB = dateB < now;

    // If both events are in the same category (past or upcoming)
    if (isPastA === isPastB) {
      // For past events, sort by most recent first
      if (isPastA) {
        return dateB - dateA;
      }
      // For upcoming events, sort by nearest first
      return dateA - dateB;
    }

    // If events are in different categories, upcoming events come first
    return isPastA ? 1 : -1;
  });

  return (
    <ScrollSection>
      <EventsRow>
        {sortedEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onEdit={() => onEdit(event)}
            onDelete={() => onDelete(event)}
            isPast={new Date(event.date) < new Date()}
          />
        ))}
      </EventsRow>
    </ScrollSection>
  );
};

export default EventsGrid;
