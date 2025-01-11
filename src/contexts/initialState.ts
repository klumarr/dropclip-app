import { EventsState } from "./types";
import { initialEventFormData } from "../types/events";

export const initialState: EventsState = {
  events: {
    upcoming: [],
    past: [],
    automatic: [],
  },
  isLoading: false,
  error: null,
  newEvent: initialEventFormData,
  selectedEvent: null,
  eventToDelete: null,
  isCreateDialogOpen: false,
  isDeleteDialogOpen: false,
  isScannerOpen: false,
  uploadProgress: 0,
  user: null,
};
