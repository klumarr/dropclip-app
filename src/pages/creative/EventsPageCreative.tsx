import { useState, useEffect } from "react";
import {
  Box,
  CircularProgress,
  Container,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import EventCard from "../../components/events/EventCard";
import {
  ScrollSection,
  EventsRow,
} from "../../components/events/EventsPageStyles";
import { eventOperations, Event } from "../../services/events.service";

interface CategorizedEvents {
  upcoming: Event[];
  past: Event[];
  automatic: Event[];
}

const EventsPageCreative: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useAuth();

  const [events, setEvents] = useState<CategorizedEvents>({
    upcoming: [],
    past: [],
    automatic: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const fetchEvents = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const eventsData = await eventOperations.getCreativeEvents();

      // Sort events by date
      const sortByDate = (a: Event, b: Event) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      };

      const now = new Date();
      const categorizedEvents = eventsData.reduce<CategorizedEvents>(
        (acc, event) => {
          const eventDate = new Date(event.date);
          if (event.isAutomatic) {
            acc.automatic.push(event);
          } else if (eventDate >= now) {
            acc.upcoming.push(event);
          } else {
            acc.past.push(event);
          }
          return acc;
        },
        { upcoming: [], past: [], automatic: [] }
      );

      // Sort each category
      categorizedEvents.upcoming.sort(sortByDate);
      categorizedEvents.past.sort(sortByDate);
      categorizedEvents.automatic.sort(sortByDate);

      setEvents(categorizedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to fetch events");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const handleEditEvent = async (event: Event) => {
    try {
      await eventOperations.updateEvent(event.id, event);
      fetchEvents(); // Refresh the list
    } catch (error) {
      console.error("Error updating event:", error);
      setError("Failed to update event");
    }
  };

  const handleDeleteEvent = async (event: Event) => {
    try {
      await eventOperations.deleteEvent(event.id);
      fetchEvents(); // Refresh the list
    } catch (error) {
      console.error("Error deleting event:", error);
      setError("Failed to delete event");
    }
  };

  const renderEventCard = (
    event: Event,
    isPast: boolean = false
  ): JSX.Element => (
    <EventCard
      key={event.id}
      event={event}
      onEdit={() => handleEditEvent(event)}
      onDelete={() => handleDeleteEvent(event)}
      isPast={isPast}
    />
  );

  const renderPastEvents = (): JSX.Element => {
    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <ScrollSection>
        <EventsRow>
          {events.past.map((event) => renderEventCard(event, true))}
        </EventsRow>
      </ScrollSection>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        {error && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              bgcolor: "error.main",
              color: "error.contrastText",
              borderRadius: 1,
            }}
          >
            {error}
          </Box>
        )}

        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
          variant={isMobile ? "fullWidth" : "standard"}
        >
          <Tab label="Upcoming" />
          <Tab label="Past" />
          <Tab label="Automatic" />
        </Tabs>

        {activeTab === 0 && (
          <ScrollSection>
            <EventsRow>
              {events.upcoming.map((event) => renderEventCard(event))}
            </EventsRow>
          </ScrollSection>
        )}

        {activeTab === 1 && renderPastEvents()}

        {activeTab === 2 && (
          <ScrollSection>
            <EventsRow>
              {events.automatic.map((event) => renderEventCard(event))}
            </EventsRow>
          </ScrollSection>
        )}
      </Box>
    </Container>
  );
};

export default EventsPageCreative;
