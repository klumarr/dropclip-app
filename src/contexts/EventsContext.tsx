import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { Event, EventFormData } from "../types/events";
import { eventsReducer, initialState } from "./eventsReducer";
import { EventsService } from "../services/eventsService";
import { useAuth } from "./AuthContext";

interface EventsContextType {
  events: Event[];
  loading: boolean;
  error: string | null;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (isOpen: boolean) => void;
  fetchEvents: () => Promise<void>;
  createEvent: (eventData: EventFormData) => Promise<Event>;
  updateEvent: (eventId: string, eventData: Partial<Event>) => Promise<Event>;
  deleteEvent: (eventId: string) => Promise<void>;
  shareEvent: (eventId: string) => Promise<void>;
  setError: (error: string | null) => void;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const EventsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(eventsReducer, initialState);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const eventsService = useRef(new EventsService());

  // Prevent state updates after unmount
  const mounted = useRef(true);
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const safeDispatch = (action: any) => {
    if (mounted.current) {
      dispatch(action);
    }
  };

  const fetchEvents = async () => {
    if (!isAuthenticated || !user?.id) {
      console.log("User not authenticated, skipping fetch");
      return;
    }

    try {
      safeDispatch({ type: "SET_LOADING", payload: true });
      console.log("Fetching events for user:", user.id);
      const events = await eventsService.current.listEvents(user.id);
      console.log("Events fetched successfully:", events.length);
      safeDispatch({ type: "SET_EVENTS", payload: events });
    } catch (error) {
      console.error("Error fetching events:", error);
      safeDispatch({
        type: "SET_ERROR",
        payload: "Failed to fetch events. Please try again.",
      });
    } finally {
      safeDispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const createEvent = async (eventData: EventFormData): Promise<Event> => {
    if (!isAuthenticated || !user?.id) {
      throw new Error("User not authenticated");
    }

    try {
      safeDispatch({ type: "SET_LOADING", payload: true });
      console.log("Creating event for user:", user.id);
      const event = await eventsService.current.createEvent(user.id, eventData);
      console.log("Event created successfully:", event.id);
      safeDispatch({ type: "ADD_EVENT", payload: event });
      return event;
    } catch (error) {
      console.error("Error creating event:", error);
      safeDispatch({
        type: "SET_ERROR",
        payload: "Failed to create event. Please try again.",
      });
      throw error;
    } finally {
      safeDispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const updateEvent = async (
    eventId: string,
    eventData: Partial<Event>
  ): Promise<Event> => {
    if (!isAuthenticated || !user?.id) {
      throw new Error("User not authenticated");
    }

    try {
      safeDispatch({ type: "SET_LOADING", payload: true });
      console.log("Updating event:", eventId);
      const updatedEvent = await eventsService.current.updateEvent(
        eventId,
        user.id,
        eventData
      );
      console.log("Event updated successfully:", updatedEvent.id);
      safeDispatch({ type: "UPDATE_EVENT", payload: updatedEvent });
      return updatedEvent;
    } catch (error) {
      console.error("Error updating event:", error);
      safeDispatch({
        type: "SET_ERROR",
        payload: "Failed to update event. Please try again.",
      });
      throw error;
    } finally {
      safeDispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const deleteEvent = async (eventId: string): Promise<void> => {
    if (!isAuthenticated || !user?.id) {
      throw new Error("User not authenticated");
    }

    try {
      safeDispatch({ type: "SET_LOADING", payload: true });
      console.log("Deleting event:", eventId);
      await eventsService.current.deleteEvent(eventId, user.id);
      console.log("Event deleted successfully");
      safeDispatch({ type: "DELETE_EVENT", payload: eventId });
    } catch (error) {
      console.error("Error deleting event:", error);
      safeDispatch({
        type: "SET_ERROR",
        payload: "Failed to delete event. Please try again.",
      });
      throw error;
    } finally {
      safeDispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Fetch events when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchEvents();
    }
  }, [isAuthenticated, user?.id]);

  const value = {
    events: state.events,
    loading: state.loading,
    error: state.error,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    shareEvent: async (eventId: string) => {
      if (!isAuthenticated || !user?.id) {
        throw new Error("User not authenticated");
      }

      try {
        safeDispatch({ type: "SET_LOADING", payload: true });
        console.log("Sharing event:", eventId);
        // TODO: Implement share functionality
        console.log("Event shared successfully");
      } catch (error) {
        console.error("Error sharing event:", error);
        safeDispatch({
          type: "SET_ERROR",
          payload: "Failed to share event. Please try again.",
        });
        throw error;
      } finally {
        safeDispatch({ type: "SET_LOADING", payload: false });
      }
    },
    setError: (error: string | null) => {
      safeDispatch({ type: "SET_ERROR", payload: error });
    },
  };

  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return context;
};
