import { uploadOperations } from "./dynamodb.service";
import { playlistOperations } from "./playlist.service";
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

        for (const operation of operations) {
          switch (operation.type) {
            case "transcode":
              // Implement transcoding logic with event context
              await uploadOperations.updateUploadStatus(
                uploadId,
                eventId,
                "processing"
              );
              // TODO: Add transcoding implementation
              break;
            case "thumbnail":
              // Implement thumbnail generation with event context
              await uploadOperations.updateUploadStatus(
                uploadId,
                eventId,
                "processing"
              );
              // TODO: Add thumbnail generation implementation
              break;
            case "metadata":
              // Implement metadata extraction with event context
              await uploadOperations.updateUploadStatus(
                uploadId,
                eventId,
                "processing"
              );
              // TODO: Add metadata extraction implementation
              break;
          }
        }

        // Update status to completed after all operations
        await uploadOperations.updateUploadStatus(
          uploadId,
          eventId,
          "completed"
        );
        result.successful.push(uploadId);
      } catch (error) {
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
