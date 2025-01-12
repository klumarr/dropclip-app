import React from "react";
import { Typography } from "@mui/material";
import EventCard from "../../common/EventCard";
import { EventsGridProps } from "./types";
import { ScrollSection, EventsRow } from "../EventsPageStyles";
import { isDatePast } from "../../../../utils/dateUtils";

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

  // Sort events by date and time
  const sortedEvents = [...events].sort((a, b) => {
    const dateTimeA = new Date(`${a.date}T${a.time || "23:59:59"}`).getTime();
    const dateTimeB = new Date(`${b.date}T${b.time || "23:59:59"}`).getTime();
    const now = Date.now();
    const isPastA = dateTimeA < now;
    const isPastB = dateTimeB < now;

    // If both events are in the same category (past or upcoming)
    if (isPastA === isPastB) {
      // For past events, sort by most recent first
      if (isPastA) {
        return dateTimeB - dateTimeA;
      }
      // For upcoming events, sort by nearest first
      return dateTimeA - dateTimeB;
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
            isPast={isDatePast(event.date, event.time)}
          />
        ))}
      </EventsRow>
    </ScrollSection>
  );
};

export default EventsGrid;
