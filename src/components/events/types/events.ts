import { Event, EventFormData, UploadConfig } from "../../../types/events";

export type { EventFormData, UploadConfig };
export type { Event };

export interface EventsListProps {
  events: Event[];
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  isPast?: boolean;
}

export interface CategorizedEvents {
  upcoming: Event[];
  past: Event[];
  automatic: Event[];
}

export const defaultUploadConfig: UploadConfig = {
  enabled: false,
  allowedTypes: ["image/*", "video/*"],
  maxFileSize: 100,
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  startTime: "",
  endTime: "",
};

export const initialEventFormData: EventFormData = {
  title: "",
  description: "",
  date: new Date().toISOString().split("T")[0],
  startTime: "",
  endTime: "",
  location: "",
  ticketLink: "",
  imageUrl: "",
  isAutomatic: false,
  uploadConfig: defaultUploadConfig,
};
