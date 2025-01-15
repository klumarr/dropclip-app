import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { Event } from "../../../../types/events";
import EventCard from "../../common/EventCard";
import { ScrollSection, EventsRow } from "../EventsPageStyles";

type FilterType = "all" | "upcoming" | "past";

interface EventCardListProps {
  events: Event[];
  onEditClick: (event: Event) => void;
  onDeleteClick: (event: Event) => void;
}

export const EventCardList: React.FC<EventCardListProps> = ({
  events,
  onEditClick,
  onDeleteClick,
}) => {
  const [filter, setFilter] = useState<FilterType>("all");

  const handleFilterChange = (
    _event: React.MouseEvent<HTMLElement>,
    newFilter: FilterType | null
  ) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const filteredEvents = React.useMemo(() => {
    const now = new Date();
    return events
      .filter((event) => {
        const eventDate = new Date(`${event.date}T${event.time}`);
        switch (filter) {
          case "upcoming":
            return eventDate >= now;
          case "past":
            return eventDate < now;
          default:
            return true;
        }
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
  }, [events, filter]);

  return (
    <Paper elevation={2} sx={{ bgcolor: "background.paper", p: 2 }}>
      <Box mb={2}>
        <Typography variant="h6" gutterBottom>
          Events
        </Typography>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          aria-label="event filter"
          size="small"
        >
          <ToggleButton value="all" aria-label="show all events">
            All
          </ToggleButton>
          <ToggleButton value="upcoming" aria-label="show upcoming events">
            Upcoming
          </ToggleButton>
          <ToggleButton value="past" aria-label="show past events">
            Past
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {filteredEvents.length === 0 ? (
        <Typography variant="body1" color="textSecondary" align="center">
          No {filter === "all" ? "" : filter} events found
        </Typography>
      ) : (
        <ScrollSection>
          <EventsRow>
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={() => onEditClick(event)}
                onDelete={() => onDeleteClick(event)}
                onShare={async () => {
                  console.log("Share clicked for event:", event.name);
                }}
                isPast={new Date(`${event.date}T${event.time}`) < new Date()}
              />
            ))}
          </EventsRow>
        </ScrollSection>
      )}
    </Paper>
  );
};
