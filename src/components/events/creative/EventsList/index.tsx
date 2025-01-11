import React, { useState, Suspense } from "react";
import { Box, Typography } from "@mui/material";
import { useEvents } from "../../../../contexts/EventsContext";
import { useEventActions } from "../../../../hooks/useEventActions";
import { ErrorBoundary } from "../../../common/ErrorBoundary";
import { LoadingState } from "../../../common/LoadingState";
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
  const { events, isLoading, setIsCreateDialogOpen, isCreateDialogOpen } =
    useEvents();
  const { handleInitiateEdit, handleInitiateDelete } = useEventActions();
  const [activeTab, setActiveTab] = useState(0);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (isLoading) {
    return <LoadingState message="Loading events..." />;
  }

  return (
    <div className={className}>
      <EventTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        upcomingCount={events?.upcoming?.length ?? 0}
        pastCount={events?.past?.length ?? 0}
        automaticCount={events?.automatic?.length ?? 0}
      />

      <TabPanel value={activeTab} index={0}>
        <Suspense
          fallback={<LoadingState message="Loading upcoming events..." />}
        >
          {events?.upcoming?.length > 0 ? (
            <EventsGrid
              events={events.upcoming}
              onEdit={handleInitiateEdit}
              onDelete={handleInitiateDelete}
              emptyMessage="No upcoming events"
            />
          ) : (
            <EmptyState message="No upcoming events" />
          )}
        </Suspense>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Suspense fallback={<LoadingState message="Loading past events..." />}>
          {events?.past?.length > 0 ? (
            <EventsGrid
              events={events.past}
              onEdit={handleInitiateEdit}
              onDelete={handleInitiateDelete}
              emptyMessage="No past events"
            />
          ) : (
            <EmptyState message="No past events" />
          )}
        </Suspense>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Suspense
          fallback={<LoadingState message="Loading automatic events..." />}
        >
          {events?.automatic?.length > 0 ? (
            <EventsGrid
              events={events.automatic}
              onEdit={handleInitiateEdit}
              onDelete={handleInitiateDelete}
              emptyMessage="No automatic events"
            />
          ) : (
            <EmptyState message="No automatic events" />
          )}
        </Suspense>
      </TabPanel>

      <ActionButtons
        onCreateClick={() => setIsCreateDialogOpen(true)}
        onScanClick={() => setIsScannerOpen(true)}
      />

      <FlyerScanner
        open={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </div>
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
