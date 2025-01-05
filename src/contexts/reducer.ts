import { Event, EventFormData } from "../types/events";
import { EventsState } from "./types";

export enum EventsActionType {
  SET_LOADING = "SET_LOADING",
  SET_ERROR = "SET_ERROR",
  SET_EVENTS = "SET_EVENTS",
  SET_NEW_EVENT = "SET_NEW_EVENT",
  SET_CREATE_DIALOG_OPEN = "SET_CREATE_DIALOG_OPEN",
  SET_SCANNER_OPEN = "SET_SCANNER_OPEN",
  SET_SELECTED_EVENT = "SET_SELECTED_EVENT",
  SET_DELETE_DIALOG_OPEN = "SET_DELETE_DIALOG_OPEN",
  SET_EVENT_TO_DELETE = "SET_EVENT_TO_DELETE",
  SET_UPLOAD_PROGRESS = "SET_UPLOAD_PROGRESS",
  ADD_EVENT = "ADD_EVENT",
  UPDATE_EVENT = "UPDATE_EVENT",
  REMOVE_EVENT = "REMOVE_EVENT",
}

export type EventsAction =
  | { type: EventsActionType.SET_LOADING; payload: boolean }
  | { type: EventsActionType.SET_ERROR; payload: string | null }
  | {
      type: EventsActionType.SET_EVENTS;
      payload: { upcoming: Event[]; past: Event[]; automatic: Event[] };
    }
  | { type: EventsActionType.SET_NEW_EVENT; payload: EventFormData }
  | { type: EventsActionType.SET_CREATE_DIALOG_OPEN; payload: boolean }
  | { type: EventsActionType.SET_SCANNER_OPEN; payload: boolean }
  | { type: EventsActionType.SET_SELECTED_EVENT; payload: Event | null }
  | { type: EventsActionType.SET_DELETE_DIALOG_OPEN; payload: boolean }
  | { type: EventsActionType.SET_EVENT_TO_DELETE; payload: Event | null }
  | { type: EventsActionType.SET_UPLOAD_PROGRESS; payload: number }
  | { type: EventsActionType.ADD_EVENT; payload: Event }
  | { type: EventsActionType.UPDATE_EVENT; payload: Event }
  | { type: EventsActionType.REMOVE_EVENT; payload: string };

export const eventsReducer = (
  state: EventsState,
  action: EventsAction
): EventsState => {
  switch (action.type) {
    case EventsActionType.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case EventsActionType.SET_ERROR:
      return { ...state, error: action.payload };

    case EventsActionType.SET_EVENTS:
      return { ...state, events: action.payload };

    case EventsActionType.SET_NEW_EVENT:
      return { ...state, newEvent: action.payload };

    case EventsActionType.SET_CREATE_DIALOG_OPEN:
      return { ...state, isCreateDialogOpen: action.payload };

    case EventsActionType.SET_SCANNER_OPEN:
      return { ...state, isScannerOpen: action.payload };

    case EventsActionType.SET_SELECTED_EVENT:
      return { ...state, selectedEvent: action.payload };

    case EventsActionType.SET_DELETE_DIALOG_OPEN:
      return { ...state, isDeleteDialogOpen: action.payload };

    case EventsActionType.SET_EVENT_TO_DELETE:
      return { ...state, eventToDelete: action.payload };

    case EventsActionType.SET_UPLOAD_PROGRESS:
      return { ...state, uploadProgress: action.payload };

    case EventsActionType.ADD_EVENT: {
      const event = action.payload;
      const now = new Date();
      const eventDate = new Date(event.date);

      if (event.isAutomatic) {
        return {
          ...state,
          events: {
            ...state.events,
            automatic: [...state.events.automatic, event],
          },
        };
      }

      return {
        ...state,
        events: {
          ...state.events,
          upcoming:
            eventDate >= now
              ? [...state.events.upcoming, event]
              : state.events.upcoming,
          past:
            eventDate < now ? [...state.events.past, event] : state.events.past,
        },
      };
    }

    case EventsActionType.UPDATE_EVENT: {
      const updatedEvent = action.payload;
      const now = new Date();
      const eventDate = new Date(updatedEvent.date);

      if (updatedEvent.isAutomatic) {
        return {
          ...state,
          events: {
            ...state.events,
            automatic: state.events.automatic.map((event) =>
              event.id === updatedEvent.id ? updatedEvent : event
            ),
          },
        };
      }

      return {
        ...state,
        events: {
          ...state.events,
          upcoming:
            eventDate >= now
              ? state.events.upcoming.map((event) =>
                  event.id === updatedEvent.id ? updatedEvent : event
                )
              : state.events.upcoming.filter(
                  (event) => event.id !== updatedEvent.id
                ),
          past:
            eventDate < now
              ? state.events.past.map((event) =>
                  event.id === updatedEvent.id ? updatedEvent : event
                )
              : state.events.past.filter(
                  (event) => event.id !== updatedEvent.id
                ),
        },
      };
    }

    case EventsActionType.REMOVE_EVENT: {
      const eventId = action.payload;
      return {
        ...state,
        events: {
          upcoming: state.events.upcoming.filter(
            (event) => event.id !== eventId
          ),
          past: state.events.past.filter((event) => event.id !== eventId),
          automatic: state.events.automatic.filter(
            (event) => event.id !== eventId
          ),
        },
      };
    }

    default:
      return state;
  }
};
