import React, { useState, useEffect } from "react";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import { styled } from "@mui/material/styles";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import {
  Add as AddIcon,
  DocumentScanner as DocumentScannerIcon,
} from "@mui/icons-material";
import { useEvents } from "../../contexts/EventsContext";
import { ErrorBoundary } from "../../components/common/ErrorBoundary";
import { LoadingState } from "../../components/common/LoadingState";
import { OperationFeedback } from "../../components/common/OperationFeedback";
import { ResponsiveContainer } from "../../components/layout/ResponsiveContainer";
import { EventsGrid } from "../../components/events/creative/EventsGrid";
import { CreateEventDialog } from "../../components/events/creative/CreateEventDialog";
import { Event, EventFormData } from "../../types/events";
import { useOperation } from "../../hooks/useOperation";
import { isDatePast } from "../../utils/dateUtils";

const TabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 0),
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const CustomTabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
}) => (
  <TabPanel
    role="tabpanel"
    hidden={value !== index}
    id={`events-tabpanel-${index}`}
    aria-labelledby={`events-tab-${index}`}
  >
    {value === index && children}
  </TabPanel>
);

const EventsContent: React.FC = () => {
  const {
    events = [],
    loading,
    error,
    createEvent,
    deleteEvent,
    shareEvent,
    fetchEvents,
    setError,
  } = useEvents();

  const [activeTab, setActiveTab] = useState(0);
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const createOperation = useOperation("create", {
    onSuccess: () => {
      setIsCreateDialogOpen(false);
      fetchEvents();
    },
  });

  const deleteOperation = useOperation("delete", {
    onSuccess: () => fetchEvents(),
  });

  const shareOperation = useOperation("share");

  useEffect(() => {
    const loadEvents = async () => {
      try {
        await fetchEvents();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch events");
      }
    };
    loadEvents();
  }, [fetchEvents, setError]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSpeedDialAction = (actionName: string) => {
    setIsSpeedDialOpen(false);
    if (actionName === "New Event") {
      setIsCreateDialogOpen(true);
    }
  };

  const handleEdit = (event: Event) => {
    console.log("Edit event:", event);
    // TODO: Implement edit functionality
  };

  const handleDelete = async (event: Event) => {
    await deleteOperation.executeOperation(
      () => deleteEvent(event.id),
      "Failed to delete event"
    );
  };

  const handleShare = async (event: Event) => {
    await shareOperation.executeOperation(
      () => shareEvent(event.id),
      "Failed to share event"
    );
  };

  const handleCreateEvent = async (formData: EventFormData) => {
    await createOperation.executeOperation(
      () => createEvent(formData),
      "Failed to create event"
    );
  };

  if (loading) {
    return (
      <LoadingState
        message="Loading events..."
        type="circular"
        variant="contained"
        fullscreen
      />
    );
  }

  // Filter events based on date and time
  const upcomingEvents = Array.isArray(events)
    ? events.filter((event) => !isDatePast(event.date, event.time))
    : [];
  const pastEvents = Array.isArray(events)
    ? events.filter((event) => isDatePast(event.date, event.time))
    : [];

  return (
    <ResponsiveContainer maxWidth="lg" spacing={3}>
      <Box sx={{ width: "100%", position: "relative", pb: 10 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="event tabs"
          >
            <Tab label={`Upcoming (${upcomingEvents.length})`} />
            <Tab label={`Past (${pastEvents.length})`} />
          </Tabs>
        </Box>

        <ErrorBoundary>
          {activeTab === 0 && (
            <EventsGrid
              events={upcomingEvents}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onShare={handleShare}
              emptyMessage="No upcoming events"
            />
          )}

          {activeTab === 1 && (
            <EventsGrid
              events={pastEvents}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onShare={handleShare}
              emptyMessage="No past events"
            />
          )}
        </ErrorBoundary>

        <SpeedDial
          ariaLabel="Event actions"
          sx={{ position: "fixed", bottom: 80, right: 16 }}
          icon={<SpeedDialIcon />}
          onClose={() => setIsSpeedDialOpen(false)}
          onOpen={() => setIsSpeedDialOpen(true)}
          open={isSpeedDialOpen}
        >
          <SpeedDialAction
            icon={<AddIcon />}
            tooltipTitle="New Event"
            tooltipOpen
            onClick={() => handleSpeedDialAction("New Event")}
          />
          <SpeedDialAction
            icon={<DocumentScannerIcon />}
            tooltipTitle="Scan"
            tooltipOpen
            onClick={() => handleSpeedDialAction("Scan")}
          />
        </SpeedDial>

        <CreateEventDialog
          open={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={handleCreateEvent}
        />

        <OperationFeedback
          state={createOperation.state}
          type="create"
          onClose={createOperation.reset}
        />
        <OperationFeedback
          state={deleteOperation.state}
          type="delete"
          onClose={deleteOperation.reset}
        />
        <OperationFeedback
          state={shareOperation.state}
          type="share"
          onClose={shareOperation.reset}
        />
      </Box>
    </ResponsiveContainer>
  );
};

const CreativeEventsPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <EventsContent />
    </ErrorBoundary>
  );
};

export default CreativeEventsPage;
