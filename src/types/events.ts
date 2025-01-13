/**
 * Event-related type definitions
 */

export interface EventDetails {
  name: string;
  description: string;
  type: string;
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
}

export interface UploadConfig {
  enabled: boolean;
  startTime?: string;
  endTime?: string;
  maxFileSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
}

export interface Event {
  id: string;
  creativeId: string;
  identityId: string;
  name: string;
  description: string;
  flyerUrl?: string; // Optional for now as we're not implementing upload yet
  date: string; // Start date
  time: string; // Start time
  endDate?: string; // For events ending next day
  endTime?: string; // End time
  venue: string;
  city: string;
  country: string;
  ticketLink?: string;
  type: EventType; // For dropdown
  tags?: string[]; // Optional tags
  createdAt: string;
  updatedAt: string;
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
  type?: string;
  ticketLink?: string;
  general?: string;
}

export interface EventsContextType {
  events: Event[];
  loading: boolean;
  error: string | null;
  isCreateDialogOpen: boolean;
  createEvent: (formData: EventFormData) => Promise<Event>;
  updateEvent: (id: string, formData: EventFormData) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;
  shareEvent: (id: string) => Promise<void>;
  fetchEvents: () => Promise<void>;
  setError: (error: string | null) => void;
  setIsCreateDialogOpen: (isOpen: boolean) => void;
}
