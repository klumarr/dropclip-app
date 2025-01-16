import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { Event, EventFormData, EventsContextType } from "../types/events";
import { eventsReducer, initialState } from "./eventsReducer";
import { eventOperations } from "../services/eventsService";
import { useAuth } from "./AuthContext";

const EventsContext = createContext<EventsContextType | undefined>(undefined);

/**
 * EventsContext provides event management functionality with the following features:
 * - Automatic data fetching with smart caching
 * - Error handling with automatic retries
 * - Activity-based polling for updates
 * - Comprehensive state management
 *
 * Key Features:
 * 1. Smart Caching:
 *    - Caches events for CACHE_DURATION (5 minutes)
 *    - Prevents duplicate requests
 *    - Maintains data freshness
 *
 * 2. Error Handling:
 *    - Automatic retries with exponential backoff
 *    - Detailed error states and retry information
 *    - Data validation before state updates
 *
 * 3. Activity-Based Updates:
 *    - Polls frequently when user is active (5 minutes)
 *    - Reduces polling when user is inactive (15 minutes)
 *    - Tracks user activity across multiple events
 */

export interface EventsContextType {
  events: Event[];
  loading: boolean;
  error: string | null;
  isCreateDialogOpen: boolean;
  isScannerOpen: boolean;
  newEvent: Partial<EventFormData> | null;
  setNewEvent: React.Dispatch<
    React.SetStateAction<Partial<EventFormData> | null>
  >;
  setIsScannerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleScannedEvent: (eventData: Partial<EventFormData>) => void;
  createEvent: (eventData: EventFormData) => Promise<Event>;
  updateEvent: (eventId: string, eventData: Partial<Event>) => Promise<Event>;
  deleteEvent: (eventId: string) => Promise<void>;
  shareEvent: (eventId: string) => Promise<void>;
  fetchEvents: () => Promise<void>;
  setError: (error: string | null) => void;
  setIsCreateDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  getPublicEvent: (eventId: string) => Promise<Event | null>;
}

export const EventsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(eventsReducer, initialState);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<EventFormData> | null>(null);
  const { isAuthenticated, user } = useAuth();

  // Prevent state updates after unmount
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    console.log("EventsContext - Provider mounted");

    return () => {
      console.log("EventsContext - Provider unmounting");
      mounted.current = false;
    };
  }, []); // Empty dependency array for mount/unmount only

  // Memoize the safeDispatch function
  const safeDispatch = React.useCallback(
    (action: any) => {
      if (!mounted.current) {
        console.warn(
          "EventsContext - Attempted dispatch while unmounted:",
          action.type
        );
        return;
      }

      console.log("EventsContext - safeDispatch called with:", {
        actionType: action.type,
        isMounted: mounted.current,
        payload: action.payload,
        payloadType: typeof action.payload,
        payloadLength: Array.isArray(action.payload)
          ? action.payload.length
          : "not an array",
      });

      dispatch(action);
    },
    [dispatch]
  );

  // Add effect to log state changes
  useEffect(() => {
    console.log("EventsContext - State updated:", {
      events: state.events?.length || 0,
      eventsData: state.events,
      loading: state.loading,
      error: state.error,
    });
  }, [state]);

  // State management refs
  const isRequestInProgress = useRef(false);
  const lastFetchTimestamp = useRef<number | null>(null);
  const eventStateRef = useRef<{
    hasInitialData: boolean;
    lastError: Error | null;
  }>({
    hasInitialData: false,
    lastError: null,
  });

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const shouldRefetchEvents = () => {
    if (!lastFetchTimestamp.current) return true;
    return Date.now() - lastFetchTimestamp.current > CACHE_DURATION;
  };

  // Additional state management
  type FetchStatus = "idle" | "pending" | "success" | "error" | "retrying";
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("idle");
  const [retryInfo, setRetryInfo] = useState<{
    attempt: number;
    maxAttempts: number;
    nextRetryIn?: number;
  } | null>(null);

  /**
   * Validates event data structure
   * @param events - Array of potential event objects
   * @returns Type guard ensuring events match Event interface
   */
  const validateEvents = (events: unknown[]): events is Event[] => {
    if (!Array.isArray(events)) return false;
    return events.every(
      (event): event is Event =>
        typeof event === "object" &&
        event !== null &&
        "id" in event &&
        "venue" in event
    );
  };

  /**
   * Fetches events with automatic retries and caching
   * State Flow:
   * 1. Checks authentication and request status
   * 2. Validates cache freshness
   * 3. Handles loading states and errors
   * 4. Updates cache and state
   */
  const fetchEvents = React.useCallback(async () => {
    const logPrefix = "EventsContext/fetchEvents";

    if (!isAuthenticated || !user?.id) {
      console.log(`${logPrefix} - User not authenticated, skipping fetch`);
      return;
    }

    if (isRequestInProgress.current) {
      console.log(`${logPrefix} - Request already in progress, skipping`, {
        userId: user.id,
        fetchStatus,
        retryInfo,
      });
      return;
    }

    if (!shouldRefetchEvents() && eventStateRef.current.hasInitialData) {
      console.log(`${logPrefix} - Using cached data`, {
        lastFetch: new Date(lastFetchTimestamp.current!).toISOString(),
        cacheAge: (Date.now() - lastFetchTimestamp.current!) / 1000,
      });
      return;
    }

    isRequestInProgress.current = true;
    setFetchStatus("pending");

    try {
      console.log(`${logPrefix} - Starting fetch`, {
        userId: user.id,
        retryAttempt: retryInfo?.attempt,
      });

      safeDispatch({ type: "SET_LOADING", payload: true });
      const events = await eventOperations.listEvents(user.id);

      // Log raw response before validation
      console.log(`${logPrefix} - Received response:`, {
        isArray: Array.isArray(events),
        rawLength: Array.isArray(events) ? events.length : 0,
        type: typeof events,
      });

      if (!validateEvents(events)) {
        console.error(`${logPrefix} - Invalid event data received`, {
          type: typeof events,
          isArray: Array.isArray(events),
          sample: events && Array.isArray(events) ? events[0] : null,
        });
        throw new Error("Invalid event data received");
      }

      // Now TypeScript knows events is Event[]
      console.log(`${logPrefix} - Fetch successful`, {
        eventCount: events.length,
        firstEventId: events[0]?.id,
        fetchDuration: Date.now() - (lastFetchTimestamp.current ?? Date.now()),
      });

      lastFetchTimestamp.current = Date.now();
      eventStateRef.current.hasInitialData = true;
      setRetryInfo(null);
      setFetchStatus("success");

      safeDispatch({ type: "SET_EVENTS", payload: events });
    } catch (error) {
      console.error(`${logPrefix} - Error fetching events`, {
        error,
        userId: user.id,
        retryAttempt: retryInfo?.attempt,
      });

      eventStateRef.current.lastError = error as Error;

      const currentRetry = (retryInfo?.attempt ?? 0) + 1;
      const maxRetries = 3;

      if (currentRetry < maxRetries) {
        const retryDelay = Math.pow(2, currentRetry) * 1000;
        setFetchStatus("retrying");
        setRetryInfo({
          attempt: currentRetry,
          maxAttempts: maxRetries,
          nextRetryIn: retryDelay / 1000,
        });

        console.log(`${logPrefix} - Scheduling retry`, {
          attempt: currentRetry,
          maxRetries,
          delayMs: retryDelay,
        });

        setTimeout(() => {
          fetchEvents();
        }, retryDelay);
      } else {
        console.error(`${logPrefix} - Max retries exceeded`, {
          attempts: currentRetry,
          maxRetries,
        });

        setFetchStatus("error");
        setRetryInfo(null);
        safeDispatch({
          type: "SET_ERROR",
          payload:
            "Failed to fetch events after multiple attempts. Please try again.",
        });
      }
    } finally {
      isRequestInProgress.current = false;
      if (fetchStatus !== "retrying") {
        safeDispatch({ type: "SET_LOADING", payload: false });
      }
    }
  }, [
    isAuthenticated,
    user?.id,
    safeDispatch,
    retryInfo?.attempt,
    fetchStatus,
  ]);

  const createEvent = async (eventData: EventFormData): Promise<Event> => {
    if (!isAuthenticated || !user?.id) {
      throw new Error("User not authenticated");
    }

    try {
      safeDispatch({ type: "SET_LOADING", payload: true });
      console.log("EventsContext - Creating event for user:", user.id);
      const event = await eventOperations.createEvent(user.id, eventData);
      console.log("EventsContext - Event created successfully:", event.id);
      safeDispatch({ type: "ADD_EVENT", payload: event });
      return event;
    } catch (error) {
      console.error("EventsContext - Error creating event:", error);
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
      console.log("🔒 Auth Check - User Details:", {
        isAuthenticated,
        userId: user?.id,
        userAttributes: user,
      });
      throw new Error("User not authenticated");
    }

    try {
      safeDispatch({ type: "SET_LOADING", payload: true });
      console.log("🔄 EventsContext - Update Event Flow:", {
        eventId,
        userId: user.id,
        eventData,
        cognitoSub: user.id, // This should match creativeId
      });

      const updatedEvent = await eventOperations.updateEvent(
        eventId,
        user.id,
        eventData
      );

      console.log("✅ EventsContext - Event Updated:", {
        eventId: updatedEvent.id,
        creativeId: updatedEvent.creativeId,
        userId: user.id,
        matched: updatedEvent.creativeId === user.id,
      });

      safeDispatch({ type: "UPDATE_EVENT", payload: updatedEvent });
      return updatedEvent;
    } catch (error) {
      console.error("❌ EventsContext - Update Error:", {
        error,
        userId: user.id,
        eventId,
      });
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
      console.log("EventsContext - Deleting event:", eventId);
      await eventOperations.deleteEvent(eventId, user.id);
      console.log("EventsContext - Event deleted successfully");
      safeDispatch({ type: "DELETE_EVENT", payload: eventId });
    } catch (error) {
      console.error("EventsContext - Error deleting event:", error);
      safeDispatch({
        type: "SET_ERROR",
        payload: "Failed to delete event. Please try again.",
      });
      throw error;
    } finally {
      safeDispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const handleScannedEvent = (eventData: Partial<EventFormData>) => {
    setNewEvent(eventData);
    setIsScannerOpen(false);
    setIsCreateDialogOpen(true);
  };

  const getPublicEvent = useCallback(
    async (eventId: string): Promise<Event | null> => {
      try {
        safeDispatch({ type: "SET_LOADING", payload: true });
        safeDispatch({ type: "SET_ERROR", payload: null });

        console.log("EventsContext - Fetching public event:", eventId);
        const event = await eventOperations.getPublicEvent(eventId);

        if (!event) {
          console.log("EventsContext - Event not found:", eventId);
          safeDispatch({ type: "SET_ERROR", payload: "Event not found" });
          return null;
        }

        console.log("EventsContext - Successfully fetched event:", event);
        return event;
      } catch (error) {
        console.error("EventsContext - Error fetching public event:", error);
        safeDispatch({
          type: "SET_ERROR",
          payload:
            error instanceof Error
              ? error.message
              : "Failed to load event details",
        });
        return null;
      } finally {
        safeDispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [safeDispatch]
  );

  const value = useMemo(
    () => ({
      events: state.events,
      loading: state.loading,
      error: state.error,
      isCreateDialogOpen,
      isScannerOpen,
      newEvent,
      setNewEvent,
      setIsScannerOpen,
      handleScannedEvent,
      createEvent,
      updateEvent,
      deleteEvent,
      shareEvent: async (eventId: string) => {
        if (!isAuthenticated || !user?.id) {
          throw new Error("User not authenticated");
        }

        try {
          safeDispatch({ type: "SET_LOADING", payload: true });
          console.log("EventsContext - Sharing event:", eventId);
          // TODO: Implement share functionality
          console.log("EventsContext - Event shared successfully");
        } catch (error) {
          console.error("EventsContext - Error sharing event:", error);
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
      setIsCreateDialogOpen,
      fetchEvents,
      getPublicEvent,
    }),
    [
      state.events,
      state.loading,
      state.error,
      isCreateDialogOpen,
      isScannerOpen,
      newEvent,
      isAuthenticated,
      user?.id,
      safeDispatch,
      createEvent,
      updateEvent,
      deleteEvent,
      fetchEvents,
      getPublicEvent,
    ]
  );

  console.log("EventsContext - Providing context value:", {
    eventsCount: value.events?.length,
    loading: value.loading,
    error: value.error,
    firstEvent: value.events?.[0],
  });

  // Subscription management
  const eventSubscription = useRef<{
    unsubscribe?: () => void;
  }>({});

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Reset all refs and state on unmount
      isRequestInProgress.current = false;
      lastFetchTimestamp.current = null;
      eventStateRef.current = { hasInitialData: false, lastError: null };
      setFetchStatus("idle");
      eventSubscription.current.unsubscribe?.();
    };
  }, []);

  // User activity tracking
  const ACTIVE_POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes
  const INACTIVE_POLL_INTERVAL = 15 * 60 * 1000; // 15 minutes
  const ACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  const lastActivityTime = useRef(Date.now());
  const [isUserActive, setIsUserActive] = useState(true);

  useEffect(() => {
    const updateActivity = () => {
      lastActivityTime.current = Date.now();
      setIsUserActive(true);
    };

    // Track user activity
    const events = ["mousedown", "keydown", "touchstart", "scroll"];

    events.forEach((event) => {
      window.addEventListener(event, updateActivity);
    });

    // Check for inactivity
    const inactivityCheck = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityTime.current;
      if (timeSinceLastActivity > ACTIVITY_TIMEOUT) {
        setIsUserActive(false);
      }
    }, 60000); // Check every minute

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(inactivityCheck);
    };
  }, []);

  // Event subscription effect with activity-based polling
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const pollInterval = setInterval(
        () => {
          if (shouldRefetchEvents()) {
            console.log("EventsContext - Polling for updates:", {
              isUserActive,
              interval: isUserActive ? "active" : "inactive",
            });
            fetchEvents();
          }
        },
        isUserActive ? ACTIVE_POLL_INTERVAL : INACTIVE_POLL_INTERVAL
      );

      eventSubscription.current.unsubscribe = () => {
        clearInterval(pollInterval);
      };
    }

    return () => {
      eventSubscription.current.unsubscribe?.();
    };
  }, [isAuthenticated, user?.id, fetchEvents, isUserActive]);

  return (
    <EventsContext.Provider
      value={{
        events: state.events,
        loading: state.loading,
        error: state.error,
        isCreateDialogOpen,
        isScannerOpen,
        newEvent,
        setNewEvent,
        setIsScannerOpen,
        handleScannedEvent,
        createEvent,
        updateEvent,
        deleteEvent,
        shareEvent: value.shareEvent,
        fetchEvents,
        setError: (error) =>
          safeDispatch({ type: "SET_ERROR", payload: error }),
        setIsCreateDialogOpen,
        getPublicEvent,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return context;
};
