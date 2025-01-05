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

  // Sort events by date (nearest first)
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.date + (a.startTime || ""));
    const dateB = new Date(b.date + (b.startTime || ""));
    return (
      Math.abs(dateA.getTime() - Date.now()) -
      Math.abs(dateB.getTime() - Date.now())
    );
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
            onShare={() => {}} // TODO: Implement share functionality
            isPast={new Date(event.date) < new Date()}
          />
        ))}
      </EventsRow>
    </ScrollSection>
  );
};

export default EventsGrid;
