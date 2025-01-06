import { uploadOperations } from "./dynamodb.service";
import { s3Operations } from "./s3.service";
import { UploadItem } from "../config/dynamodb";
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

interface UploadProgress {
  loaded: number;
  total: number;
}

export class UploadService {
  private readonly MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
  private readonly ALLOWED_TYPES = [
    "video/mp4",
    "video/quicktime",
    "video/x-m4v",
  ];
  private readonly MODERATION_QUEUE_THRESHOLD = 10;

  validateFile(file: File): void {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new UploadError("File size exceeds 500MB limit", "FILE_TOO_LARGE");
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new UploadError(
        "Only MP4, MOV, and M4V files are allowed",
        "INVALID_FILE_TYPE"
      );
    }
  }

  private async checkModerationQueueThreshold(
    eventId: string,
    eventOwnerId: string
  ) {
    try {
      const pendingUploads = await uploadOperations.listEventUploads(eventId);
      const pendingCount = pendingUploads.filter(
        (u) => u.status === "pending"
      ).length;

      if (pendingCount >= this.MODERATION_QUEUE_THRESHOLD) {
        await notificationService.createNotification({
          userId: eventOwnerId,
          type: "moderation",
          status: "unread",
          title: "Moderation Queue Alert",
          message: `You have ${pendingCount} uploads pending review for this event`,
          metadata: { eventId },
        });
      }
    } catch (error) {
      console.error("Failed to check moderation queue threshold:", error);
    }
  }

  private async checkUploadLimit(
    userId: string,
    eventId: string,
    currentCount: number,
    maxLimit: number
  ) {
    if (currentCount >= maxLimit - 2) {
      // Warn when 2 or fewer uploads remaining
      try {
        await notificationService.createNotification({
          userId,
          type: "upload",
          status: "unread",
          title: "Upload Limit Warning",
          message: `You have ${
            maxLimit - currentCount
          } uploads remaining for this event`,
          metadata: { eventId },
        });
      } catch (error) {
        console.error("Failed to send upload limit notification:", error);
      }
    }
  }

  async createUpload(
    params: {
      id: string;
      eventId: string;
      userId: string;
      file: File;
    },
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadItem> {
    try {
      // Validate file
      this.validateFile(params.file);

      // Generate file key and get upload URL
      const fileKey = s3Operations.generateFileKey(
        params.eventId,
        params.userId,
        params.file.name
      );

      // Create upload record
      const upload = await uploadOperations.createUpload(
        {
          id: params.id,
          eventId: params.eventId,
          userId: params.userId,
          fileType: "video",
          fileKey,
          status: "pending",
          processingStatus: "pending",
          userEventId: params.userId,
          uploadDateEventId: `${new Date().toISOString()}#${params.eventId}`,
        },
        params.file
      );

      // Handle progress updates
      if (onProgress) {
        onProgress({
          loaded: 0,
          total: params.file.size,
        });
      }

      // Send notification to creative about new upload
      try {
        await notificationService.createGroupedNotification(
          upload.eventOwnerId,
          "upload",
          "New Fan Upload",
          `A new video has been uploaded to your event`,
          {
            eventId: upload.eventId,
            uploadId: upload.id,
          }
        );

        // Check moderation queue threshold
        await this.checkModerationQueueThreshold(
          params.eventId,
          upload.eventOwnerId
        );

        // Check upload limits
        const userUploads = await this.listUserUploads(params.userId);
        const eventUploads = userUploads.filter(
          (u) => u.eventId === params.eventId
        );
        await this.checkUploadLimit(
          params.userId,
          params.eventId,
          eventUploads.length,
          10
        ); // Assuming 10 is max limit

        // Notify fan that processing has started
        await notificationService.createNotification({
          userId: params.userId,
          type: "upload",
          status: "unread",
          title: "Upload Processing Started",
          message:
            "Your video is now being processed. We'll notify you when it's ready for review.",
          metadata: {
            eventId: params.eventId,
            uploadId: upload.id,
          },
        });
      } catch (notifyError) {
        console.error("Failed to send notifications:", notifyError);
      }

      return upload;
    } catch (error) {
      if (error instanceof UploadError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.message.includes("unauthorized")) {
          throw new UploadError(
            "You are not authorized to upload files",
            "UNAUTHORIZED"
          );
        }
        if (error.message.includes("network")) {
          throw new UploadError(
            "Network error occurred during upload",
            "NETWORK_ERROR"
          );
        }
      }

      throw new UploadError(
        "An unexpected error occurred during upload",
        "UNKNOWN"
      );
    }
  }

  async getUploadStatus(
    uploadId: string,
    eventId: string
  ): Promise<UploadItem | undefined> {
    try {
      const upload = await uploadOperations.getUpload(uploadId, eventId);

      // If status has changed to processing complete, notify the uploader
      if (
        upload?.status === "pending" &&
        upload.processingStatus === "completed"
      ) {
        try {
          await notificationService.createNotification({
            userId: upload.userId,
            type: "upload",
            status: "unread",
            title: "Upload Processing Complete",
            message: "Your video has been processed and is ready for review",
            metadata: {
              eventId,
              uploadId,
            },
          });
        } catch (notifyError) {
          console.error("Failed to send notification:", notifyError);
        }
      }

      return upload;
    } catch (error) {
      throw new UploadError("Failed to get upload status", "UNKNOWN");
    }
  }

  async listEventUploads(eventId: string): Promise<UploadItem[]> {
    try {
      return await uploadOperations.listEventUploads(eventId);
    } catch (error) {
      throw new UploadError("Failed to list event uploads", "UNKNOWN");
    }
  }

  async listUserUploads(userId: string): Promise<UploadItem[]> {
    try {
      return await uploadOperations.listUserUploads(userId);
    } catch (error) {
      throw new UploadError("Failed to list user uploads", "UNKNOWN");
    }
  }

  async updateUploadStatus(
    uploadId: string,
    eventId: string,
    status: UploadItem["status"]
  ): Promise<void> {
    try {
      const upload = await uploadOperations.getUpload(uploadId, eventId);
      if (!upload) throw new Error("Upload not found");

      await uploadOperations.updateUploadStatus(uploadId, eventId, status);

      // Send notifications based on status change
      try {
        switch (status) {
          case "approved":
            await notificationService.createNotification({
              userId: upload.userId,
              type: "upload",
              status: "unread",
              title: "Upload Approved",
              message: "Your upload has been approved and is now visible",
              metadata: {
                eventId,
                uploadId,
              },
            });
            break;
          case "rejected":
            await notificationService.createNotification({
              userId: upload.userId,
              type: "upload",
              status: "unread",
              title: "Upload Rejected",
              message:
                "Your upload has been rejected. Please check our content guidelines.",
              metadata: {
                eventId,
                uploadId,
              },
            });
            break;
        }

        // After status update, check moderation queue threshold again
        await this.checkModerationQueueThreshold(eventId, upload.eventOwnerId);
      } catch (notifyError) {
        console.error("Failed to send notification:", notifyError);
      }
    } catch (error) {
      throw new UploadError("Failed to update upload status", "UNKNOWN");
    }
  }
}

export const uploadService = new UploadService();
