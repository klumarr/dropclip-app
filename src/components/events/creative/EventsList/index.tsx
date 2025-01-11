import React, { useState } from "react";
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
import { ScrollSection, EventsRow } from "../EventsPageStyles";

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

export const EventsList: React.FC<EventsListProps> = ({ className }) => {
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
    <ErrorBoundary>
      <div className={className}>
        <EventTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          upcomingCount={events?.upcoming?.length ?? 0}
          pastCount={events?.past?.length ?? 0}
          automaticCount={events?.automatic?.length ?? 0}
        />

        <TabPanel value={activeTab} index={0}>
          <ScrollSection>
            {events?.upcoming?.length > 0 ? (
              <EventsRow>
                {events.upcoming.map((event) => (
                  <EventsGrid
                    key={event.id}
                    events={[event]}
                    onEdit={handleInitiateEdit}
                    onDelete={handleInitiateDelete}
                    emptyMessage="No upcoming events"
                  />
                ))}
              </EventsRow>
            ) : (
              <EmptyState message="No upcoming events" />
            )}
          </ScrollSection>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <ScrollSection>
            {events?.past?.length > 0 ? (
              <EventsRow>
                {events.past.map((event) => (
                  <EventsGrid
                    key={event.id}
                    events={[event]}
                    onEdit={handleInitiateEdit}
                    onDelete={handleInitiateDelete}
                    emptyMessage="No past events"
                  />
                ))}
              </EventsRow>
            ) : (
              <EmptyState message="No past events" />
            )}
          </ScrollSection>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <ScrollSection>
            {events?.automatic?.length > 0 ? (
              <EventsRow>
                {events.automatic.map((event) => (
                  <EventsGrid
                    key={event.id}
                    events={[event]}
                    onEdit={handleInitiateEdit}
                    onDelete={handleInitiateDelete}
                    emptyMessage="No automatic events"
                  />
                ))}
              </EventsRow>
            ) : (
              <EmptyState message="No automatic events" />
            )}
          </ScrollSection>
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
    </ErrorBoundary>
  );
};

export default EventsList;
