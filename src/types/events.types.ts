export interface Event {
  id: string;
  creativeId: string;
  identityId: string;
  dateId: string;
  dateCreativeId: string;
  name: string;
  title?: string;
  description: string;
  date: string;
  time: string;
  endDate?: string;
  endTime?: string;
  venue: string;
  city: string;
  country: string;
  flyerUrl?: string;
  type: EventType;
  creativeName: string;
  creativeType: string;
  creativePhotoUrl?: string;
  creativeBio?: string;
  creativeStats?: CreativeStats;
  createdAt: string;
  updatedAt: string;
}

export interface EventFormData {
  name: string;
  title?: string;
  description: string;
  date: string;
  time: string;
  endDate?: string;
  endTime?: string;
  venue: string;
  city: string;
  country: string;
  type: EventType;
  creativeName?: string;
  creativeType?: string;
  creativePhotoUrl?: string;
  creativeBio?: string;
  creativeStats?: CreativeStats;
}

export interface CreativeStats {
  upcomingEvents: number;
  totalEvents: number;
  followers: number;
}

export interface UploadConfig {
  uploadUrl: string;
  fileKey: string;
}

export type EventType =
  | "Concert"
  | "Festival"
  | "Club Night"
  | "Private Event"
  | "Corporate Event"
  | "Other";
