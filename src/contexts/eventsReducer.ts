import { Event } from "../types/events";

interface State {
  events: Event[];
  loading: boolean;
  error: string | null;
}

export const initialState: State = {
  events: [],
  loading: false,
  error: null,
};

type Action =
  | { type: "SET_EVENTS"; payload: Event[] }
  | { type: "ADD_EVENT"; payload: Event }
  | { type: "UPDATE_EVENT"; payload: Event }
  | { type: "DELETE_EVENT"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

export const eventsReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_EVENTS":
      return {
        ...state,
        events: action.payload,
        error: null,
      };

    case "ADD_EVENT":
      return {
        ...state,
        events: [...state.events, action.payload],
        error: null,
      };

    case "UPDATE_EVENT":
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.payload.id ? action.payload : event
        ),
        error: null,
      };

    case "DELETE_EVENT":
      return {
        ...state,
        events: state.events.filter((event) => event.id !== action.payload),
        error: null,
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    default:
      return state;
  }
};
