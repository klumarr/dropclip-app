import { uploadOperations } from "./dynamodb.service";
import { playlistOperations } from "./playlist.service";
import { videoOperations, ProcessingOptions } from "./video.service";
import { UploadItem } from "../config/dynamodb";

interface BatchUploadResult {
  successful: string[];
  failed: Array<{ id: string; error: string }>;
}

export const batchOperations = {
  addUploadsToPlaylist: async (
    playlistId: string,
    uploadIds: string[]
  ): Promise<BatchUploadResult> => {
    const result: BatchUploadResult = {
      successful: [],
      failed: [],
    };

    for (const uploadId of uploadIds) {
      try {
        await playlistOperations.addToPlaylist(playlistId, uploadId);
        result.successful.push(uploadId);
      } catch (error) {
        result.failed.push({
          id: uploadId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return result;
  },

  removeUploadsFromPlaylist: async (
    playlistId: string,
    uploadIds: string[]
  ): Promise<BatchUploadResult> => {
    const result: BatchUploadResult = {
      successful: [],
      failed: [],
    };

    for (const uploadId of uploadIds) {
      try {
        await playlistOperations.removeFromPlaylist(playlistId, uploadId);
        result.successful.push(uploadId);
      } catch (error) {
        result.failed.push({
          id: uploadId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return result;
  },

  updateUploadStatuses: async (
    eventId: string,
    uploadIds: string[],
    status: UploadItem["status"]
  ): Promise<BatchUploadResult> => {
    const result: BatchUploadResult = {
      successful: [],
      failed: [],
    };

    for (const uploadId of uploadIds) {
      try {
        await uploadOperations.updateUploadStatus(uploadId, eventId, status);
        result.successful.push(uploadId);
      } catch (error) {
        result.failed.push({
          id: uploadId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return result;
  },

  processUploads: async (
    eventId: string,
    uploadIds: string[],
    operations: Array<{
      type: "transcode" | "thumbnail" | "metadata";
      options?: Record<string, any>;
    }>
  ): Promise<BatchUploadResult> => {
    console.log(`Processing uploads for event ${eventId}:`, uploadIds);

    const result: BatchUploadResult = {
      successful: [],
      failed: [],
    };

    for (const uploadId of uploadIds) {
      try {
        // First verify the upload belongs to this event
        const upload = await uploadOperations.getUpload(uploadId, eventId);
        if (!upload) {
          throw new Error(`Upload ${uploadId} not found in event ${eventId}`);
        }

        // Convert batch operations to ProcessingOptions
        const processingOptions: ProcessingOptions = {
          generateThumbnails: operations.some((op) => op.type === "thumbnail"),
          thumbnailCount:
            operations.find((op) => op.type === "thumbnail")?.options?.count ??
            3,
          extractMetadata: operations.some((op) => op.type === "metadata"),
          qualities: operations.find((op) => op.type === "transcode")?.options
            ?.qualities,
        };

        // Start video processing
        const processingResult = await videoOperations.startProcessing(
          uploadId,
          eventId,
          upload.fileKey,
          processingOptions
        );

        if (processingResult.status === "failed") {
          throw new Error(processingResult.error || "Processing failed");
        }

        result.successful.push(uploadId);
      } catch (error) {
        console.error(`Failed to process upload ${uploadId}:`, error);

        // Update status to rejected if processing fails
        await uploadOperations
          .updateUploadStatus(uploadId, eventId, "rejected")
          .catch((e) =>
            console.error("Failed to update status after error:", e)
          );

        result.failed.push({
          id: uploadId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return result;
  },
};
