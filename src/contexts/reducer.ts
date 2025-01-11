import { Event, EventFormData } from "../types/events";
import { User } from "../types/auth";
import { EventsState } from "./types";

export enum EventsActionType {
  SET_LOADING = "SET_LOADING",
  SET_ERROR = "SET_ERROR",
  SET_EVENTS = "SET_EVENTS",
  SET_NEW_EVENT = "SET_NEW_EVENT",
  SET_SELECTED_EVENT = "SET_SELECTED_EVENT",
  SET_EVENT_TO_DELETE = "SET_EVENT_TO_DELETE",
  SET_CREATE_DIALOG_OPEN = "SET_CREATE_DIALOG_OPEN",
  SET_DELETE_DIALOG_OPEN = "SET_DELETE_DIALOG_OPEN",
  SET_SCANNER_OPEN = "SET_SCANNER_OPEN",
  SET_UPLOAD_PROGRESS = "SET_UPLOAD_PROGRESS",
  SET_USER = "SET_USER",
}

type EventsAction =
  | { type: EventsActionType.SET_LOADING; payload: boolean }
  | { type: EventsActionType.SET_ERROR; payload: string | null }
  | {
      type: EventsActionType.SET_EVENTS;
      payload: { upcoming: Event[]; past: Event[]; automatic: Event[] };
    }
  | { type: EventsActionType.SET_NEW_EVENT; payload: EventFormData }
  | { type: EventsActionType.SET_SELECTED_EVENT; payload: Event | null }
  | { type: EventsActionType.SET_EVENT_TO_DELETE; payload: Event | null }
  | { type: EventsActionType.SET_CREATE_DIALOG_OPEN; payload: boolean }
  | { type: EventsActionType.SET_DELETE_DIALOG_OPEN; payload: boolean }
  | { type: EventsActionType.SET_SCANNER_OPEN; payload: boolean }
  | { type: EventsActionType.SET_UPLOAD_PROGRESS; payload: number }
  | { type: EventsActionType.SET_USER; payload: User | null };

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
    case EventsActionType.SET_SELECTED_EVENT:
      return { ...state, selectedEvent: action.payload };
    case EventsActionType.SET_EVENT_TO_DELETE:
      return { ...state, eventToDelete: action.payload };
    case EventsActionType.SET_CREATE_DIALOG_OPEN:
      return { ...state, isCreateDialogOpen: action.payload };
    case EventsActionType.SET_DELETE_DIALOG_OPEN:
      return { ...state, isDeleteDialogOpen: action.payload };
    case EventsActionType.SET_SCANNER_OPEN:
      return { ...state, isScannerOpen: action.payload };
    case EventsActionType.SET_UPLOAD_PROGRESS:
      return { ...state, uploadProgress: action.payload };
    case EventsActionType.SET_USER:
      return { ...state, user: action.payload };
    default:
      return state;
  }
};
