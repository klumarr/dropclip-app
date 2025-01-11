export interface EventItem {
  id: string;
  creativeId: string;
  name: string;
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  dateId: string; // YYYY-MM
  dateCreativeId: string; // date#creativeId
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
