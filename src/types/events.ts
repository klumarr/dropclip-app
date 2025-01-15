/**
 * Event-related type definitions
 */

export interface EventDetails {
  name: string;
  description: string;
  type: EventType;
  title?: string;
  tags: string[];
  suggestedTags: string[];
  date: string;
  time: string;
  endDate: string;
  endTime: string;
  venue: string;
  city: string;
  country: string;
  ticketLink?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  flyerImage?: File | null;
  flyerImageUrl?: string;
  flyerUrl?: string;
  isAutomatic?: boolean;
}

export interface UploadConfig {
  enabled: boolean;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  maxFileSize: number;
  allowedTypes: string[];
  maxFiles: number;
  remainingUploads?: number;
}

export interface Event {
  id: string;
  creativeId: string;
  identityId: string;
  dateId: string; // For date-based querying
  dateCreativeId: string; // For date-creative compound querying
  name: string;
  title?: string;
  description: string;
  flyerUrl?: string;
  imageUrl?: string;
  date: string;
  time: string;
  endDate?: string;
  endTime?: string;
  venue: string;
  city: string;
  country: string;
  location?: string;
  ticketLink?: string;
  type: EventType;
  tags?: string[];
  isAutomatic?: boolean;
  createdAt: string;
  updatedAt: string;
  uploadConfig?: UploadConfig;
}

export type EventType =
  | "Concert"
  | "Festival"
  | "Club Night"
  | "Private Event"
  | "Corporate Event"
  | "Other";

export interface EventFormData {
  name: string;
  description: string;
  flyerUrl?: string;
  flyerImage?: File | null;
  date: string;
  time: string;
  endDate?: string;
  endTime?: string;
  venue: string;
  city: string;
  country: string;
  ticketLink?: string;
  type: EventType;
  tags?: string[];
  uploadConfig: UploadConfig;
}

export interface EventFormErrors {
  name?: string;
  description?: string;
  date?: string;
  time?: string;
  endDate?: string;
  endTime?: string;
  venue?: string;
  city?: string;
  country?: string;
  tags?: string;
  type?: string;
  ticketLink?: string;
  flyerImage?: string;
  uploadConfig?: {
    startTime?: string;
    endTime?: string;
    maxFileSize?: string;
    maxFiles?: string;
    allowedTypes?: string;
    enabled?: string;
    startDate?: string;
    endDate?: string;
  };
}

export interface EventsContextType {
  events: Event[];
  loading: boolean;
  error: string | null;
  isCreateDialogOpen: boolean;
  isScannerOpen: boolean;
  newEvent: Partial<EventFormData> | null;
  setNewEvent: (event: Partial<EventFormData> | null) => void;
  setIsScannerOpen: (isOpen: boolean) => void;
  handleScannedEvent: (eventData: Partial<EventFormData>) => void;
  createEvent: (formData: EventFormData) => Promise<Event>;
  updateEvent: (id: string, formData: EventFormData) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;
  shareEvent: (id: string) => Promise<void>;
  fetchEvents: () => Promise<void>;
  setError: (error: string | null) => void;
  setIsCreateDialogOpen: (isOpen: boolean) => void;
}

export interface CategorizedEvents {
  upcoming: Event[];
  past: Event[];
}

export const defaultUploadConfig: UploadConfig = {
  enabled: false,
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedTypes: ["video/*"],
  maxFiles: 10,
};

export const initialEventFormData: EventFormData = {
  name: "",
  description: "",
  type: "Other",
  tags: [],
  date: "",
  time: "",
  endDate: "",
  endTime: "",
  venue: "",
  city: "",
  country: "",
  uploadConfig: defaultUploadConfig,
};
