import { Event, EventFormData } from "../types/events";

export interface EventsState {
  events: {
    upcoming: Event[];
    past: Event[];
    automatic: Event[];
  };
  isLoading: boolean;
  error: string | null;
  newEvent: EventFormData;
  selectedEvent: Event | null;
  eventToDelete: Event | null;
  isCreateDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  isScannerOpen: boolean;
  uploadProgress: number;
}

export interface EventsContextValue extends EventsState {
  // Event CRUD operations
  fetchEvents: () => Promise<void>;
  createEvent: (event: Omit<Event, "id">) => Promise<Event>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;

  // State setters
  setNewEvent: (event: EventFormData) => void;
  setSelectedEvent: (event: Event | null) => void;
  setEventToDelete: (event: Event | null) => void;
  setIsCreateDialogOpen: (open: boolean) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  setIsScannerOpen: (open: boolean) => void;
  setUploadProgress: (progress: number) => void;
  setError: (error: string | null) => void;

  // Event handlers
  handleCreateEvent: () => Promise<void>;
  handleUpdateEvent: () => Promise<void>;
  handleDeleteEvent: () => Promise<void>;
  handleScannedEvent: (eventData: Partial<Event>) => void;
}

export interface EventsProviderProps {
  children: React.ReactNode;
}
