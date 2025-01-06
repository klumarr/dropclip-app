export interface Upload {
  id: string;
  eventId: string;
  uploaderId: string;
  uploaderName: string;
  fileUrl: string;
  thumbnailUrl?: string;
  status: "pending" | "approved" | "rejected";
  uploadedAt: string;
  fileType: "video" | "image";
  fileSize: number;
  metadata?: {
    duration?: number;
    resolution?: string;
  };
}

export interface UploadItem extends Upload {
  userId: string;
  eventOwnerId: string;
  fileKey: string;
  userEventId: string;
  uploadDateEventId: string;
  processingStatus: "pending" | "processing" | "completed" | "failed";
}
