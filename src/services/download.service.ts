import { s3Operations } from "./s3.service";
import { uploadOperations } from "./operations/upload.operations";
import { notificationService } from "./notification.service";
import { Upload, UploadItem } from "../types/uploads";

export class DownloadError extends Error {
  constructor(
    message: string,
    public code: "FILE_NOT_FOUND" | "UNAUTHORIZED" | "NETWORK_ERROR" | "UNKNOWN"
  ) {
    super(message);
    this.name = "DownloadError";
  }
}

interface DownloadOptions {
  quality?: string;
  forceDownload?: boolean;
}

export class DownloadService {
  async getDownloadUrl(
    uploadId: string,
    eventId: string,
    options: DownloadOptions = {}
  ): Promise<string> {
    try {
      const upload = await uploadOperations.getUpload(uploadId, eventId);
      if (!upload) {
        throw new DownloadError("Upload not found", "FILE_NOT_FOUND");
      }

      // Check if the upload is approved
      if (upload.status !== "approved") {
        throw new DownloadError(
          "Upload is not approved for download",
          "UNAUTHORIZED"
        );
      }

      // Get the signed URL from S3
      const signedUrl = await s3Operations.getSignedUrl(
        upload.fileKey,
        options.forceDownload ? "attachment" : "inline"
      );

      // Track the download
      await this.trackDownload(uploadId, eventId);

      return signedUrl;
    } catch (error) {
      console.error(
        `Failed to get download URL for upload ${uploadId}:`,
        error
      );
      if (error instanceof DownloadError) {
        throw error;
      }
      throw new DownloadError(
        "Failed to get download URL",
        error instanceof Error && error.message.includes("NetworkError")
          ? "NETWORK_ERROR"
          : "UNKNOWN"
      );
    }
  }

  private async trackDownload(
    uploadId: string,
    eventId: string
  ): Promise<void> {
    try {
      // Get the upload to check owner
      const upload = await uploadOperations.getUpload(uploadId, eventId);
      if (!upload) return;

      // Create a notification for the download
      await notificationService.createNotification({
        userId: upload.userId,
        type: "download",
        status: "unread",
        title: "New Download",
        message: "Someone downloaded your content",
        metadata: {
          uploadId,
          eventId,
        },
      });
    } catch (error) {
      console.error("Failed to track download:", error);
      // Don't throw error for tracking failure
    }
  }

  async getDownloadProgress(
    uploadId: string,
    eventId: string
  ): Promise<{ downloaded: number; total: number }> {
    try {
      const upload = await uploadOperations.getUpload(uploadId, eventId);
      if (!upload) {
        throw new DownloadError("Upload not found", "FILE_NOT_FOUND");
      }

      // Since UploadItem extends Upload, we can safely access fileSize
      const uploadWithSize = upload as Upload;
      const totalSize = uploadWithSize.fileSize ?? 0;

      // This would typically come from your download tracking system
      // For now, we'll return a mock progress
      return {
        downloaded: 0,
        total: totalSize,
      };
    } catch (error) {
      console.error(
        `Failed to get download progress for upload ${uploadId}:`,
        error
      );
      throw error;
    }
  }

  async cancelDownload(uploadId: string, eventId: string): Promise<void> {
    // This would typically cancel an in-progress download
    // Since browser downloads can't be cancelled programmatically,
    // this is more relevant for a download manager implementation
    console.log(`Cancelling download for upload ${uploadId}`);
  }
}

export const downloadService = new DownloadService();
