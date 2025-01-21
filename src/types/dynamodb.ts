export interface EventItem {
  id: string;
  creativeId: string;
  identityId: string;
  name: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  country: string;
  flyerUrl?: string;
  type: string;
  creativeName: string;
  creativeType: string;
  creativePhotoUrl?: string;
  creativeBio?: string;
  creativeStats?: {
    upcomingEvents: number;
    totalEvents: number;
    followers: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UploadItem {
  id: string;
  eventId: string;
  userId: string;
  fileType: "video" | "image";
  fileUrl: string;
  thumbnailUrl?: string;
  status: "pending" | "processing" | "completed" | "rejected";
  processingStatus?: "pending" | "processing" | "completed" | "failed";
  uploadDate: string;
  userEventId: string; // userId (for GSI)
  uploadDateEventId: string; // uploadDate#eventId (for GSI)
}

export interface UserItem {
  id: string;
  email: string;
  name: string;
  userType: "creative" | "fan";
  createdAt: string;
  updatedAt: string;
}
