import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import { eventOperations } from "../services/eventsService";
import { Event, EventFormData } from "../types/events";
import { EventsContextValue, EventsProviderProps } from "./types";
import { eventsReducer, EventsActionType } from "./reducer";
import { initialState } from "./initialState";

const EventsContext = createContext<EventsContextValue | undefined>(undefined);

export const EventsProvider: React.FC<EventsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(eventsReducer, initialState);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: EventsActionType.SET_LOADING, payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: EventsActionType.SET_ERROR, payload: error });
  }, []);

  const setEvents = useCallback((events: typeof initialState.events) => {
    dispatch({ type: EventsActionType.SET_EVENTS, payload: events });
  }, []);

  const setNewEvent = useCallback((event: EventFormData) => {
    dispatch({ type: EventsActionType.SET_NEW_EVENT, payload: event });
  }, []);

  const setIsCreateDialogOpen = useCallback((open: boolean) => {
    dispatch({ type: EventsActionType.SET_CREATE_DIALOG_OPEN, payload: open });
  }, []);

  const setIsScannerOpen = useCallback((open: boolean) => {
    dispatch({ type: EventsActionType.SET_SCANNER_OPEN, payload: open });
  }, []);

  const setSelectedEvent = useCallback((event: Event | null) => {
    dispatch({ type: EventsActionType.SET_SELECTED_EVENT, payload: event });
  }, []);

  const setIsDeleteDialogOpen = useCallback((open: boolean) => {
    dispatch({ type: EventsActionType.SET_DELETE_DIALOG_OPEN, payload: open });
  }, []);

  const setEventToDelete = useCallback((event: Event | null) => {
    dispatch({ type: EventsActionType.SET_EVENT_TO_DELETE, payload: event });
  }, []);

  const setUploadProgress = useCallback((progress: number) => {
    dispatch({ type: EventsActionType.SET_UPLOAD_PROGRESS, payload: progress });
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Starting to fetch events...");

      const response = await eventOperations.getCreativeEvents();
      console.log("Successfully fetched events:", response);

      const now = new Date();
      const categorizedEvents = response.reduce(
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
        { upcoming: [], past: [], automatic: [] } as typeof initialState.events
      );

      console.log("Categorized events:", categorizedEvents);
      setEvents(categorizedEvents);
    } catch (error) {
      console.error("Error in fetchEvents:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while fetching events";
      setError(errorMessage);
      setEvents(initialState.events);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setEvents]);

  const handleCreateEvent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const eventData: Omit<Event, "id"> = {
        ...state.newEvent,
        user_id: "",
        imageUrl: state.newEvent.imageUrl || "",
        isAutomatic: state.newEvent.isAutomatic || false,
      };
      await eventOperations.createEvent(eventData);
      setIsCreateDialogOpen(false);
      setNewEvent(initialState.newEvent);
      await fetchEvents(); // Refresh the list
    } catch (error) {
      console.error("Error creating event:", error);
      setError("Failed to create event");
    } finally {
      setLoading(false);
    }
  }, [
    state.newEvent,
    setLoading,
    setError,
    setIsCreateDialogOpen,
    setNewEvent,
    fetchEvents,
  ]);

  const handleUpdateEvent = useCallback(async () => {
    if (!state.selectedEvent) return;

    try {
      setLoading(true);
      setError(null);
      await eventOperations.updateEvent(state.selectedEvent.id, state.newEvent);
      setIsCreateDialogOpen(false);
      setSelectedEvent(null);
      setNewEvent(initialState.newEvent);
      await fetchEvents(); // Refresh the list
    } catch (error) {
      console.error("Error updating event:", error);
      setError("Failed to update event");
    } finally {
      setLoading(false);
    }
  }, [
    state.selectedEvent,
    state.newEvent,
    setLoading,
    setError,
    setIsCreateDialogOpen,
    setSelectedEvent,
    setNewEvent,
    fetchEvents,
  ]);

  const handleDeleteEvent = useCallback(async () => {
    if (!state.eventToDelete) return;

    try {
      setLoading(true);
      setError(null);
      await eventOperations.deleteEvent(state.eventToDelete.id);
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
      await fetchEvents(); // Refresh the list
    } catch (error) {
      console.error("Error deleting event:", error);
      setError("Failed to delete event");
    } finally {
      setLoading(false);
    }
  }, [
    state.eventToDelete,
    setLoading,
    setError,
    setIsDeleteDialogOpen,
    setEventToDelete,
    fetchEvents,
  ]);

  const handleScannedEvent = useCallback(
    (eventData: Partial<Event>) => {
      setNewEvent({
        title: eventData.title || "",
        date: eventData.date || new Date().toISOString().split("T")[0],
        startTime: eventData.startTime || "",
        endTime: eventData.endTime || "",
        location: eventData.location || "",
        description: eventData.description || "",
        ticketLink: eventData.ticketLink || "",
        imageUrl: eventData.imageUrl || "",
        isAutomatic: false,
        uploadConfig: initialState.newEvent.uploadConfig,
      });
      setIsScannerOpen(false);
      setIsCreateDialogOpen(true);
    },
    [setNewEvent, setIsScannerOpen, setIsCreateDialogOpen]
  );

  const value: EventsContextValue = {
    ...state,
    fetchEvents,
    createEvent: eventOperations.createEvent,
    updateEvent: eventOperations.updateEvent,
    deleteEvent: eventOperations.deleteEvent,
    setIsScannerOpen,
    setNewEvent,
    setIsCreateDialogOpen,
    setSelectedEvent,
    setIsDeleteDialogOpen,
    setEventToDelete,
    setUploadProgress,
    setError,
    handleCreateEvent,
    handleUpdateEvent,
    handleDeleteEvent,
    handleScannedEvent,
  };

  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return context;
};
