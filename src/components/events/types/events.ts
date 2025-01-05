import { Event } from "../../../services/eventsService";

export interface CategorizedEvents {
  upcoming: Event[];
  past: Event[];
  automatic: Event[];
}

export interface UploadConfig {
  enabled: boolean;
  allowedTypes: string[];
  maxFileSize: number;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
}

export interface EventFormData {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  ticketLink: string;
  imageUrl: string;
  isAutomatic: boolean;
  uploadConfig: UploadConfig;
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
