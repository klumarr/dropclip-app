/**
 * Event-related type definitions
 */

export interface EventDetails {
  title: string;
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

export interface Event extends EventDetails {
  id: string;
  userId?: string;
  creativeId: string;
  createdAt: string;
  updatedAt: string;
  status?: "draft" | "published" | "cancelled";
  uploadConfig?: UploadConfig;
  dateId: string;
  dateCreativeId: string;
}

export interface EventFormData {
  details: EventDetails;
  uploadConfig: UploadConfig;
}

export interface EventFormErrors {
  title?: string;
  description?: string;
  type?: string;
  tags?: string;
  date?: string;
  time?: string;
  endDate?: string;
  endTime?: string;
  venue?: string;
  city?: string;
  country?: string;
  flyerImage?: string;
  startTime?: string;
  allowedTypes?: string;
  maxFileSize?: string;
  maxFiles?: string;
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
