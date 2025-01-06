export interface Event {
  id: string;
  user_id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  imageUrl?: string;
  imageFile?: File;
  ticketLink: string;
  isAutomatic?: boolean;
  uploadConfig: UploadConfig;
  created_at?: string;
  updated_at?: string;
  attendees?: number;
  isInterested?: boolean;
}

export interface UploadConfig {
  enabled: boolean;
  allowedTypes: string[];
  maxFileSize: number; // in MB
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
}

export interface CategorizedEvents {
  upcoming: Event[];
  past: Event[];
  automatic: Event[];
}

export interface EventFormData {
  id?: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  ticketLink: string;
  imageUrl?: string;
  imageFile?: File;
  isAutomatic?: boolean;
  uploadConfig: UploadConfig;
}

export const defaultUploadConfig: UploadConfig = {
  enabled: false,
  allowedTypes: ["image/*", "video/*"],
  maxFileSize: 100, // 100MB default
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0], // 7 days from now
  startTime: "",
  endTime: "",
};

export const initialEventFormData: EventFormData = {
  title: "",
  date: new Date().toISOString().split("T")[0],
  startTime: "",
  endTime: "",
  location: "",
  description: "",
  ticketLink: "",
  uploadConfig: defaultUploadConfig,
};
