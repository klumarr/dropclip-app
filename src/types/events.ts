// Upload configuration interface
export interface UploadConfig {
  enabled: boolean;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  maxFileSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
  remainingUploads?: number;
}

// Form data interface
export interface EventFormData {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  ticketLink?: string;
  imageFile?: File;
  imageUrl?: string;
  isAutomatic?: boolean;
  uploadConfig: UploadConfig;
}

// Form errors interface
export type EventFormErrors = Record<string, string>;

// Event interface
export interface Event {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  ticketLink?: string;
  imageUrl?: string;
  isAutomatic?: boolean;
  uploadConfig: UploadConfig;
  createdAt: string;
  updatedAt: string;
}

// Events context interface
export interface EventsContextType {
  events: CategorizedEvents;
  loading: boolean;
  error: Error | null;
  newEvent: Partial<EventFormData> | null;
  selectedEvent: Event | null;
  eventToDelete: Event | null;
  setError: (error: Error | null) => void;
  setNewEvent: (event: Partial<EventFormData> | null) => void;
  setSelectedEvent: (event: Event | null) => void;
  setEventToDelete: (event: Event | null) => void;
  handleDeleteEvent: (eventId: string) => Promise<void>;
  fetchEvents: () => Promise<void>;
  createEvent: (userId: string, eventData: EventFormData) => Promise<Event>;
  updateEvent: (
    userId: string,
    eventId: string,
    eventData: Partial<EventFormData>
  ) => Promise<Event>;
  deleteEvent: (userId: string, eventId: string) => Promise<void>;
  isLoading: boolean;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (isOpen: boolean) => void;
  isScannerOpen: boolean;
  setIsScannerOpen: (isOpen: boolean) => void;
  handleScannedEvent: (eventData: Partial<EventFormData>) => Promise<void>;
}

// Default upload configuration
export const defaultUploadConfig: UploadConfig = {
  enabled: false,
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  maxFileSize: 100, // Default 100MB
  allowedTypes: ["video/mp4", "video/quicktime"],
};

// Initial event form data
export const initialEventFormData: EventFormData = {
  title: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  location: "",
  ticketLink: "",
  isAutomatic: false,
  uploadConfig: defaultUploadConfig,
};

export interface CategorizedEvents {
  upcoming: Event[];
  past: Event[];
  automatic: Event[];
}
