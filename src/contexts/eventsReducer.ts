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
  console.log("🔄 EventsReducer - RECEIVED ACTION:", action.type);

  console.log("EventsReducer - Processing action:", {
    type: action.type,
    payloadType: action.payload ? typeof action.payload : "undefined",
    payloadLength: Array.isArray(action.payload)
      ? action.payload.length
      : "not an array",
    currentState: {
      eventsCount: state.events.length,
      loading: state.loading,
      error: state.error,
    },
  });

  let newState: State;

  switch (action.type) {
    case "SET_EVENTS":
      console.log("🎯 EventsReducer - SET_EVENTS - Payload:", {
        eventsCount: action.payload?.length,
        firstEvent: action.payload?.[0],
        isArray: Array.isArray(action.payload),
        payloadType: typeof action.payload,
      });
      newState = {
        ...state,
        events: action.payload,
        error: null,
      };
      console.log("✅ EventsReducer - SET_EVENTS - New state:", {
        eventsCount: newState.events?.length,
        firstEvent: newState.events?.[0],
        isArray: Array.isArray(newState.events),
      });
      break;

    case "ADD_EVENT":
      newState = {
        ...state,
        events: [...state.events, action.payload],
        error: null,
      };
      break;

    case "UPDATE_EVENT":
      newState = {
        ...state,
        events: state.events.map((event) =>
          event.id === action.payload.id ? action.payload : event
        ),
        error: null,
      };
      break;

    case "DELETE_EVENT":
      newState = {
        ...state,
        events: state.events.filter((event) => event.id !== action.payload),
        error: null,
      };
      break;

    case "SET_LOADING":
      newState = {
        ...state,
        loading: action.payload,
      };
      break;

    case "SET_ERROR":
      newState = {
        ...state,
        error: action.payload,
        loading: false,
      };
      break;

    default:
      newState = state;
  }

  console.log("EventsReducer - New state:", newState);
  return newState;
};
