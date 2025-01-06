import { s3Operations } from "./s3.service";
import { uploadOperations } from "./dynamodb.service";
import { notificationService } from "./notification.service";

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
      console.log(`Getting download URL for upload ${uploadId}`);

      // Get upload details
      const upload = await uploadOperations.getUpload(uploadId, eventId);
      if (!upload) {
        throw new DownloadError("Upload not found", "FILE_NOT_FOUND");
      }

      // Check if the upload is ready for download
      if (upload.status !== "completed") {
        throw new DownloadError(
          "Upload is not ready for download",
          "FILE_NOT_FOUND"
        );
      }

      // Get the appropriate variant URL based on quality preference
      let downloadUrl = upload.fileUrl; // Default to original file
      if (options.quality && upload.variants) {
        const variant = upload.variants.find(
          (v) => v.quality === options.quality
        );
        if (variant) {
          downloadUrl = variant.url;
        }
      }

      // Generate a signed URL for download
      const signedUrl = await s3Operations.getSignedUrl(
        downloadUrl,
        options.forceDownload ? "attachment" : "inline"
      );

      // Track the download
      try {
        await this.trackDownload(uploadId, eventId);
      } catch (error) {
        console.error("Failed to track download:", error);
        // Don't throw error for tracking failure
      }

      return signedUrl;
    } catch (error) {
      console.error(
        `Failed to get download URL for upload ${uploadId}:`,
        error
      );

      if (error instanceof DownloadError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.message.includes("unauthorized")) {
          throw new DownloadError(
            "You are not authorized to download this file",
            "UNAUTHORIZED"
          );
        }
        if (error.message.includes("network")) {
          throw new DownloadError(
            "Network error occurred while getting download URL",
            "NETWORK_ERROR"
          );
        }
      }

      throw new DownloadError(
        "An unexpected error occurred while getting download URL",
        "UNKNOWN"
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

      // Notify the upload owner about the download
      await notificationService.createNotification({
        userId: upload.userId,
        type: "download",
        status: "unread",
        title: "New Download",
        message: "Someone downloaded your video",
        metadata: {
          uploadId,
          eventId,
        },
      });

      // Here you could also update analytics or download count in DynamoDB
      // This would depend on your requirements for download tracking
    } catch (error) {
      console.error("Failed to track download:", error);
      throw error;
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

      // This would typically come from your download tracking system
      // For now, we'll return a mock progress
      return {
        downloaded: 0,
        total: upload.fileSize || 0,
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
