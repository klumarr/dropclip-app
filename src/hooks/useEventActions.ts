import { useState } from "react";
import { useEvents } from "../contexts/EventsContext";
import { Event } from "../types/events";

export const useEventActions = () => {
  const { deleteEvent, updateEvent } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleInitiateDelete = async (event: Event) => {
    setSelectedEvent(event);
    await deleteEvent(event.id);
  };

  const handleInitiateEdit = async (event: Event) => {
    setSelectedEvent(event);
    // TODO: Implement edit functionality
    console.log("Edit event:", event);
  };

  return {
    selectedEvent,
    handleInitiateDelete,
    handleInitiateEdit,
  };
};

export default useEventActions;
