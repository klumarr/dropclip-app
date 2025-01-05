import React, { useState } from "react";
import { Box } from "@mui/material";
import { useEvents } from "../../../../contexts/EventsContext";
import { useEventActions } from "../../../../hooks/useEventActions";
import { ErrorBoundary } from "../../../common/ErrorBoundary";
import { LoadingState } from "../../../common/LoadingState";
import EventsGrid from "./EventsGrid";
import EventTabs from "./EventTabs";
import ActionButtons from "../ActionButtons";
import FlyerScanner from "../FlyerScanner";
import { TabPanelProps, EventsListProps } from "./types";
import { ScrollSection, EventsRow } from "../EventsPageStyles";

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && children}
  </div>
);

const EventsList: React.FC<EventsListProps> = ({ className }) => {
  const { events, isLoading, setIsCreateDialogOpen } = useEvents();
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
          upcomingCount={events.upcoming.length}
          pastCount={events.past.length}
          automaticCount={events.automatic.length}
        />

        <TabPanel value={activeTab} index={0}>
          <ScrollSection>
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
          </ScrollSection>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <ScrollSection>
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
          </ScrollSection>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <ScrollSection>
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
