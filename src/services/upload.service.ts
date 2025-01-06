import { uploadOperations } from "./operations/upload.operations";
import { s3Operations } from "./s3.service";
import { UploadItem, UploadStatus } from "../types/uploads";
import { notificationService } from "./notification.service";

export class UploadError extends Error {
  constructor(
    message: string,
    public code:
      | "FILE_TOO_LARGE"
      | "INVALID_FILE_TYPE"
      | "UPLOAD_LIMIT_REACHED"
      | "NETWORK_ERROR"
      | "UNAUTHORIZED"
      | "UNKNOWN"
  ) {
    super(message);
    this.name = "UploadError";
  }
}

export class UploadService {
  private readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  private readonly VALID_TYPES = [
    "video/mp4",
    "video/quicktime",
    "image/jpeg",
    "image/png",
  ];

  async listUserUploads(userId: string): Promise<UploadItem[]> {
    try {
      return await uploadOperations.listUserUploads(userId);
    } catch (error) {
      console.error("Error fetching user uploads:", error);
      throw new UploadError("Failed to fetch uploads", "UNKNOWN");
    }
  }

  async deleteUpload(uploadId: string, eventId: string): Promise<void> {
    try {
      // Get the upload first to get the file key
      const upload = await uploadOperations.getUpload(uploadId, eventId);
      if (!upload) {
        throw new Error("Upload not found");
      }

      // Delete from S3
      const fileKey = `uploads/${eventId}/${uploadId}`;
      await s3Operations.deleteFile(fileKey);

      // Delete thumbnail if exists
      try {
        const thumbnailKey = `thumbnails/${eventId}/${uploadId}`;
        await s3Operations.deleteFile(thumbnailKey);
      } catch (error) {
        console.log("No thumbnail found or error deleting thumbnail:", error);
      }

      // Update status to mark as deleted
      await uploadOperations.updateUploadStatus(uploadId, eventId, "rejected");
    } catch (error) {
      console.error("Error deleting upload:", error);
      throw new UploadError("Failed to delete upload", "UNKNOWN");
    }
  }

  async replaceUpload(
    uploadId: string,
    eventId: string,
    formData: FormData
  ): Promise<void> {
    try {
      // First, validate the new file
      const file = formData.get("file") as File;
      if (!file) throw new UploadError("No file provided", "INVALID_FILE_TYPE");

      // Validate file size and type
      if (file.size > this.MAX_FILE_SIZE) {
        throw new UploadError("File size exceeds limit", "FILE_TOO_LARGE");
      }

      if (!this.VALID_TYPES.includes(file.type)) {
        throw new UploadError("Invalid file type", "INVALID_FILE_TYPE");
      }

      // Get the existing upload
      const existingUpload = await uploadOperations.getUpload(
        uploadId,
        eventId
      );
      if (!existingUpload) {
        throw new Error("Upload not found");
      }

      // Delete the old files from S3
      const fileKey = `uploads/${eventId}/${uploadId}`;
      await s3Operations.deleteFile(fileKey);
      try {
        const thumbnailKey = `thumbnails/${eventId}/${uploadId}`;
        await s3Operations.deleteFile(thumbnailKey);
      } catch (error) {
        console.log("No thumbnail found or error deleting thumbnail:", error);
      }

      // Upload the new file
      const uploadResult = await s3Operations.uploadFile(
        file,
        `uploads/${eventId}`
      );

      // Create new upload record
      await uploadOperations.createUpload(
        {
          id: uploadId,
          eventId,
          userId: existingUpload.userId,
          fileType: file.type.startsWith("video/") ? "video" : "image",
          fileKey: uploadResult.key,
          status: "pending",
          userEventId: existingUpload.userId,
          uploadDateEventId: `${new Date().toISOString()}#${eventId}`,
        },
        file
      );
    } catch (error) {
      console.error("Error replacing upload:", error);
      throw new UploadError(
        "Failed to replace upload",
        error instanceof UploadError ? error.code : "UNKNOWN"
      );
    }
  }
}

export const uploadService = new UploadService();
