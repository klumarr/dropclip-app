import { Event } from "../types/events";

export type State = {
  events: Event[];
  loading: boolean;
  error: string | null;
  isCreateDialogOpen: boolean;
};

export type Action =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_EVENTS"; payload: Event[] }
  | { type: "ADD_EVENT"; payload: Event }
  | { type: "UPDATE_EVENT"; payload: Event }
  | { type: "DELETE_EVENT"; payload: string }
  | { type: "SET_CREATE_DIALOG_OPEN"; payload: boolean };

export const eventsReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "SET_EVENTS":
      return { ...state, events: action.payload };

    case "ADD_EVENT":
      return { ...state, events: [...state.events, action.payload] };

    case "UPDATE_EVENT":
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.payload.id ? action.payload : event
        ),
      };

    case "DELETE_EVENT":
      return {
        ...state,
        events: state.events.filter((event) => event.id !== action.payload),
      };

    case "SET_CREATE_DIALOG_OPEN":
      return { ...state, isCreateDialogOpen: action.payload };

    default:
      return state;
  }
};
