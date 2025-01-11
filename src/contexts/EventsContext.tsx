import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useTransition,
  startTransition,
} from "react";
import { EventsContextType, Event, EventFormData } from "../types/events";
import { eventsReducer } from "./eventsReducer";
import { eventOperations } from "../services/eventsService";
import { useAuth } from "./AuthContext";

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return context;
};

export const EventsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [state, dispatch] = useReducer(eventsReducer, {
    events: { upcoming: [], past: [], automatic: [] },
    loading: false,
    error: null,
    newEvent: null,
    selectedEvent: null,
    eventToDelete: null,
    isCreateDialogOpen: false,
    isScannerOpen: false,
  });

  const fetchEvents = useCallback(async () => {
    if (!user) return;

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const events = await eventOperations.listEvents(user.id);
      const now = new Date();

      startTransition(() => {
        // Categorize events
        const categorizedEvents = events.reduce(
          (acc, event) => {
            const eventDate = new Date(event.date);
            if (event.isAutomatic) {
              acc.automatic.push(event);
            } else if (eventDate > now) {
              acc.upcoming.push(event);
            } else {
              acc.past.push(event);
            }
            return acc;
          },
          { upcoming: [], past: [], automatic: [] }
        );

        dispatch({ type: "SET_EVENTS", payload: categorizedEvents });
      });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error : new Error("Failed to fetch events"),
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [user]);

  const createEvent = useCallback(
    async (userId: string, eventData: EventFormData) => {
      if (!user) throw new Error("User not authenticated");

      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const event = await eventOperations.createEvent(userId, eventData);
        startTransition(() => {
          dispatch({ type: "ADD_EVENT", payload: event });
        });
        return event;
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload:
            error instanceof Error
              ? error
              : new Error("Failed to create event"),
        });
        throw error;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [user]
  );

  const updateEvent = useCallback(
    async (
      userId: string,
      eventId: string,
      eventData: Partial<EventFormData>
    ) => {
      if (!user) throw new Error("User not authenticated");

      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const event = await eventOperations.updateEvent(
          userId,
          eventId,
          eventData
        );
        startTransition(() => {
          dispatch({ type: "UPDATE_EVENT", payload: event });
        });
        return event;
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload:
            error instanceof Error
              ? error
              : new Error("Failed to update event"),
        });
        throw error;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [user]
  );

  const deleteEvent = useCallback(
    async (userId: string, eventId: string) => {
      if (!user) throw new Error("User not authenticated");

      dispatch({ type: "SET_LOADING", payload: true });
      try {
        await eventOperations.deleteEvent(userId, eventId);
        startTransition(() => {
          dispatch({ type: "DELETE_EVENT", payload: eventId });
        });
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload:
            error instanceof Error
              ? error
              : new Error("Failed to delete event"),
        });
        throw error;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [user]
  );

  const handleDeleteEvent = useCallback(
    async (eventId: string) => {
      if (!user) throw new Error("User not authenticated");
      await deleteEvent(user.id, eventId);
    },
    [user, deleteEvent]
  );

  const handleScannedEvent = useCallback(
    async (eventData: Partial<EventFormData>) => {
      if (!user) throw new Error("User not authenticated");
      if (!eventData.title) throw new Error("Event title is required");

      const fullEventData: EventFormData = {
        title: eventData.title,
        description: eventData.description || "",
        date: eventData.date || new Date().toISOString(),
        startTime: eventData.startTime || "",
        endTime: eventData.endTime || "",
        location: eventData.location || "",
        ticketLink: eventData.ticketLink,
        imageUrl: eventData.imageUrl,
        isAutomatic: true,
        uploadConfig: eventData.uploadConfig || {
          enabled: false,
          maxFileSize: 100,
          allowedTypes: ["video/mp4", "video/quicktime"],
        },
      };

      await createEvent(user.id, fullEventData);
    },
    [user, createEvent]
  );

  const value = {
    ...state,
    isLoading: state.loading || isPending,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    handleDeleteEvent,
    handleScannedEvent,
    setError: (error: Error | null) =>
      dispatch({ type: "SET_ERROR", payload: error }),
    setNewEvent: (event: Partial<EventFormData> | null) =>
      startTransition(() =>
        dispatch({ type: "SET_NEW_EVENT", payload: event })
      ),
    setSelectedEvent: (event: Event | null) =>
      startTransition(() =>
        dispatch({ type: "SET_SELECTED_EVENT", payload: event })
      ),
    setEventToDelete: (event: Event | null) =>
      startTransition(() =>
        dispatch({ type: "SET_EVENT_TO_DELETE", payload: event })
      ),
    setIsCreateDialogOpen: (isOpen: boolean) =>
      startTransition(() =>
        dispatch({ type: "SET_CREATE_DIALOG_OPEN", payload: isOpen })
      ),
    setIsScannerOpen: (isOpen: boolean) =>
      startTransition(() =>
        dispatch({ type: "SET_SCANNER_OPEN", payload: isOpen })
      ),
  };

  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  );
};
