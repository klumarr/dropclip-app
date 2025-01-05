import { EventsState } from "./types";

export const initialState: EventsState = {
  events: {
    upcoming: [],
    past: [],
    automatic: [],
  },
  isLoading: false,
  error: null,
  newEvent: {
    title: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    location: "",
    description: "",
    ticketLink: "",
    imageUrl: "",
    isAutomatic: false,
    uploadConfig: {
      enabled: false,
      allowedTypes: ["image/*", "video/*"],
      maxFileSize: 100,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      startTime: "",
      endTime: "",
    },
  },
  selectedEvent: null,
  eventToDelete: null,
  isCreateDialogOpen: false,
  isDeleteDialogOpen: false,
  isScannerOpen: false,
  uploadProgress: 0,
};
