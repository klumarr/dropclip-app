import React from "react";
import { Grid, Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import { Event } from "../../../../types/events";
import { EventCard } from "../EventCard";
import { styled } from "@mui/material/styles";

// Styled components
const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(4),
  textAlign: "center",
  minHeight: 200,
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
}));

interface EventsGridProps {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  onShare: (event: Event) => void;
  emptyMessage?: string;
}

export const EventsGrid: React.FC<EventsGridProps> = ({
  events,
  onEdit,
  onDelete,
  onShare,
  emptyMessage = "No events found",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (events.length === 0) {
    return (
      <EmptyStateContainer>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {emptyMessage}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create a new event to get started
        </Typography>
      </EmptyStateContainer>
    );
  }

  return (
    <Grid container spacing={3}>
      {events.map((event) => (
        <Grid item xs={12} sm={6} md={4} key={event.id}>
          <EventCard
            event={event}
            onEdit={onEdit}
            onDelete={onDelete}
            onShare={onShare}
          />
        </Grid>
      ))}
    </Grid>
  );
};
