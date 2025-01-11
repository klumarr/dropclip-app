export enum UploadStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
  FAILED = "failed",
  COMPLETED = "completed",
}

export enum UploadError {
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  INVALID_FILE_TYPE = "INVALID_FILE_TYPE",
  UPLOAD_FAILED = "UPLOAD_FAILED",
  NETWORK_ERROR = "NETWORK_ERROR",
  CANCELLED = "CANCELLED",
  UNKNOWN = "UNKNOWN",
}

export interface Upload {
  id: string;
  userId: string;
  eventId: string;
  filename: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  status: UploadStatus;
  url?: string;
  thumbnailUrl?: string;
  metadata?: {
    duration?: number;
    resolution?: string;
    [key: string]: any;
  };
  moderationStatus?: "pending" | "approved" | "rejected";
}

export interface UploadProgress {
  uploadId: string;
  progress: number;
  status: UploadStatus;
  error?: string;
}

export interface CreateUploadParams {
  eventId: string;
  filename: string;
  fileSize: number;
  fileType: string;
  metadata?: Record<string, any>;
  file?: File;
}

export interface UpdateUploadParams {
  status?: UploadStatus;
  url?: string;
  thumbnailUrl?: string;
  metadata?: Record<string, any>;
  moderationStatus?: "pending" | "approved" | "rejected";
}
