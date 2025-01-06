export type UploadStatus = "pending" | "approved" | "rejected";

export interface Upload {
  id: string;
  eventId: string;
  uploaderId: string;
  uploaderName: string;
  fileUrl: string;
  fileKey: string;
  thumbnailUrl?: string;
  status: UploadStatus;
  uploadedAt: string;
  fileType: "video" | "image";
  fileSize: number;
  metadata?: {
    duration?: number;
    resolution?: string;
  };
}

export interface UploadItem {
  id: string;
  userId: string;
  eventId: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileName: string;
  fileType: "video" | "image";
  fileSize: number;
  status: UploadStatus;
  uploadedAt: string;
  updatedAt: string;
  processingStatus?: "processing" | "completed" | "failed";
  rejectionReason?: string;
}
