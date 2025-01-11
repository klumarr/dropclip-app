import { Event, CategorizedEvents, EventFormData } from "../types/events";

export interface EventsState {
  events: CategorizedEvents;
  loading: boolean;
  error: Error | null;
  newEvent: Partial<EventFormData> | null;
  selectedEvent: Event | null;
  eventToDelete: Event | null;
  isCreateDialogOpen: boolean;
  isScannerOpen: boolean;
}

export type EventsAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: Error | null }
  | { type: "SET_EVENTS"; payload: CategorizedEvents }
  | { type: "SET_NEW_EVENT"; payload: Partial<EventFormData> | null }
  | { type: "SET_SELECTED_EVENT"; payload: Event | null }
  | { type: "SET_EVENT_TO_DELETE"; payload: Event | null }
  | { type: "SET_CREATE_DIALOG_OPEN"; payload: boolean }
  | { type: "SET_SCANNER_OPEN"; payload: boolean }
  | { type: "ADD_EVENT"; payload: Event }
  | { type: "UPDATE_EVENT"; payload: Event }
  | { type: "DELETE_EVENT"; payload: string };

export const eventsReducer = (
  state: EventsState,
  action: EventsAction
): EventsState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "SET_EVENTS":
      return { ...state, events: action.payload };

    case "SET_NEW_EVENT":
      return { ...state, newEvent: action.payload };

    case "SET_SELECTED_EVENT":
      return { ...state, selectedEvent: action.payload };

    case "SET_EVENT_TO_DELETE":
      return { ...state, eventToDelete: action.payload };

    case "SET_CREATE_DIALOG_OPEN":
      return { ...state, isCreateDialogOpen: action.payload };

    case "SET_SCANNER_OPEN":
      return { ...state, isScannerOpen: action.payload };

    case "ADD_EVENT": {
      const event = action.payload;
      const isUpcoming = new Date(event.date) > new Date();
      const isAutomatic = event.isAutomatic;

      return {
        ...state,
        events: {
          ...state.events,
          upcoming: isUpcoming
            ? [...state.events.upcoming, event]
            : state.events.upcoming,
          past: !isUpcoming ? [...state.events.past, event] : state.events.past,
          automatic: isAutomatic
            ? [...state.events.automatic, event]
            : state.events.automatic,
        },
      };
    }

    case "UPDATE_EVENT": {
      const updatedEvent = action.payload;
      const isUpcoming = new Date(updatedEvent.date) > new Date();
      const isAutomatic = updatedEvent.isAutomatic;

      const updateEventList = (events: Event[]) =>
        events.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event
        );

      return {
        ...state,
        events: {
          upcoming: updateEventList(state.events.upcoming),
          past: updateEventList(state.events.past),
          automatic: updateEventList(state.events.automatic),
        },
      };
    }

    case "DELETE_EVENT": {
      const eventId = action.payload;

      const filterEventList = (events: Event[]) =>
        events.filter((event) => event.id !== eventId);

      return {
        ...state,
        events: {
          upcoming: filterEventList(state.events.upcoming),
          past: filterEventList(state.events.past),
          automatic: filterEventList(state.events.automatic),
        },
      };
    }

    default:
      return state;
  }
};
