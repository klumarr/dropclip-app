import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Event } from "../../../../types/events";
import { formatDate, formatTime } from "../../../../utils/dateUtils";

type FilterType = "all" | "upcoming" | "past";

interface EventListProps {
  events: Event[];
  onEditClick: (event: Event) => void;
  onDeleteClick: (event: Event) => void;
}

export const EventList: React.FC<EventListProps> = ({
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
    <Paper elevation={2}>
      <Box p={2}>
        <Typography variant="h6" gutterBottom>
          Events List Component
        </Typography>
        <Box mb={2}>
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
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Showing {filteredEvents.length} events
        </Typography>
        {filteredEvents.length === 0 ? (
          <Typography variant="body1" color="textSecondary" align="center">
            No {filter === "all" ? "" : filter} events found
          </Typography>
        ) : (
          <List>
            {filteredEvents.map((event) => (
              <ListItem
                key={event.id}
                divider
                secondaryAction={
                  <Box>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => onEditClick(event)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => onDeleteClick(event)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={event.name}
                  secondary={
                    <>
                      {formatDate(event.date)} at {formatTime(event.time)}
                      <br />
                      {event.venue}, {event.city}, {event.country}
                      {event.description && (
                        <>
                          <br />
                          {event.description}
                        </>
                      )}
                      {event.type && (
                        <>
                          <br />
                          Type: {event.type}
                        </>
                      )}
                      {event.tags && event.tags.length > 0 && (
                        <>
                          <br />
                          Tags: {event.tags.join(", ")}
                        </>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
};
