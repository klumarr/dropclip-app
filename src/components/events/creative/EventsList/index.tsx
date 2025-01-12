import React, { useState, Suspense } from "react";
import { Box, Typography } from "@mui/material";
import { useEvents } from "../../../../contexts/EventsContext";
import { useEventActions } from "../../../../hooks/useEventActions";
import { ErrorBoundary } from "../../../common/ErrorBoundary";
import { LoadingState } from "../../../common/LoadingState";
import { OperationFeedback } from "../../../common/OperationFeedback";
import { ResponsiveContainer } from "../../../layout/ResponsiveContainer";
import { useOperation } from "../../../../hooks/useOperation";
import { Event } from "../../../../types/events";
import EventsGrid from "./EventsGrid";
import EventTabs from "./EventTabs";
import ActionButtons from "../ActionButtons";
import { FlyerScanner } from "../FlyerScanner";
import { CreateEventDialog } from "../CreateEventDialog";
import { TabPanelProps, EventsListProps } from "./types";

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && children}
  </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "200px",
    }}
  >
    <Typography variant="body1" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

const EventsListContent: React.FC<EventsListProps> = ({ className }) => {
  const { events, loading, setIsCreateDialogOpen, isCreateDialogOpen } =
    useEvents();
  const { handleInitiateEdit, handleInitiateDelete } = useEventActions();
  const [activeTab, setActiveTab] = useState(0);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const deleteOperation = useOperation("delete");
  const editOperation = useOperation("update");
  const shareOperation = useOperation("share");

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDelete = async (event: Event) => {
    await deleteOperation.executeOperation(
      () => handleInitiateDelete(event),
      "Failed to delete event"
    );
  };

  const handleEdit = async (event: Event) => {
    await editOperation.executeOperation(
      () => handleInitiateEdit(event),
      "Failed to edit event"
    );
  };

  if (loading) {
    return (
      <LoadingState
        message="Loading events..."
        type="circular"
        variant="contained"
        size="medium"
      />
    );
  }

  // Filter events based on tab
  const upcomingEvents = events.filter(
    (event) => new Date(event.date) > new Date()
  );
  const pastEvents = events.filter(
    (event) => new Date(event.date) <= new Date()
  );
  const automaticEvents = events.filter((event) => event.uploadConfig?.enabled);

  return (
    <ResponsiveContainer maxWidth="lg" spacing={3}>
      <EventTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        upcomingCount={upcomingEvents.length}
        pastCount={pastEvents.length}
        automaticCount={automaticEvents.length}
      />

      <ErrorBoundary>
        <TabPanel value={activeTab} index={0}>
          <Suspense
            fallback={
              <LoadingState
                message="Loading upcoming events..."
                type="circular"
                variant="transparent"
                size="small"
              />
            }
          >
            {upcomingEvents.length > 0 ? (
              <EventsGrid
                events={upcomingEvents}
                onEdit={handleEdit}
                onDelete={handleDelete}
                emptyMessage="No upcoming events"
              />
            ) : (
              <EmptyState message="No upcoming events" />
            )}
          </Suspense>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Suspense
            fallback={
              <LoadingState
                message="Loading past events..."
                type="circular"
                variant="transparent"
                size="small"
              />
            }
          >
            {pastEvents.length > 0 ? (
              <EventsGrid
                events={pastEvents}
                onEdit={handleEdit}
                onDelete={handleDelete}
                emptyMessage="No past events"
              />
            ) : (
              <EmptyState message="No past events" />
            )}
          </Suspense>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Suspense
            fallback={
              <LoadingState
                message="Loading automatic events..."
                type="circular"
                variant="transparent"
                size="small"
              />
            }
          >
            {automaticEvents.length > 0 ? (
              <EventsGrid
                events={automaticEvents}
                onEdit={handleEdit}
                onDelete={handleDelete}
                emptyMessage="No automatic events"
              />
            ) : (
              <EmptyState message="No automatic events" />
            )}
          </Suspense>
        </TabPanel>
      </ErrorBoundary>

      <ActionButtons
        onCreateClick={() => setIsCreateDialogOpen(true)}
        onScanClick={() => setIsScannerOpen(true)}
      />

      <FlyerScanner
        open={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />

      <OperationFeedback
        state={deleteOperation.state}
        type="delete"
        onClose={deleteOperation.reset}
      />
      <OperationFeedback
        state={editOperation.state}
        type="update"
        onClose={editOperation.reset}
      />
      <OperationFeedback
        state={shareOperation.state}
        type="share"
        onClose={shareOperation.reset}
      />
    </ResponsiveContainer>
  );
};

export const EventsList: React.FC<EventsListProps> = (props) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState message="Loading events..." />}>
        <EventsListContent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default EventsList;
