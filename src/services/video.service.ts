import { lambdaOperations } from "./lambda.service";
import { uploadOperations } from "./operations/upload.operations";

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  codec: string;
  bitrate: number;
  fps: number;
}

// Partial version for processing results
export interface PartialVideoMetadata {
  duration?: number;
  width?: number;
  height?: number;
  codec?: string;
  bitrate?: number;
  fps?: number;
}

export interface ProcessingOptions {
  generateThumbnails?: boolean;
  thumbnailCount?: number;
  qualities?: Array<{
    width: number;
    height: number;
    bitrate: number;
  }>;
  extractMetadata?: boolean;
}

export interface ProcessingResult {
  id: string;
  status: "completed" | "failed" | "processing";
  metadata?: VideoMetadata;
  thumbnails?: string[];
  variants?: Array<{
    quality: string;
    url: string;
  }>;
  error?: string;
}

export const videoOperations = {
  // Start video processing pipeline
  startProcessing: async (
    uploadId: string,
    eventId: string,
    fileKey: string,
    options: ProcessingOptions = {}
  ): Promise<ProcessingResult> => {
    console.log(`Starting video processing for upload ${uploadId}`);

    try {
      // Update upload status to processing
      await uploadOperations.updateUploadStatus(
        uploadId,
        eventId,
        "processing"
      );

      // Trigger Lambda for video processing
      const result = await lambdaOperations.triggerVideoProcessing({
        uploadId,
        eventId,
        fileKey,
        options: {
          generateThumbnails: options.generateThumbnails ?? true,
          thumbnailCount: options.thumbnailCount ?? 3,
          qualities: options.qualities ?? [
            { width: 1920, height: 1080, bitrate: 6000000 }, // 1080p
            { width: 1280, height: 720, bitrate: 2500000 }, // 720p
            { width: 854, height: 480, bitrate: 1000000 }, // 480p
          ],
          extractMetadata: options.extractMetadata ?? true,
        },
      });

      return {
        id: uploadId,
        status: "processing",
        ...result,
      };
    } catch (error) {
      console.error(
        `Failed to start video processing for upload ${uploadId}:`,
        error
      );

      // Update status to failed
      await uploadOperations.updateUploadStatus(uploadId, eventId, "rejected");

      return {
        id: uploadId,
        status: "failed",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },

  // Get processing status
  getProcessingStatus: async (
    uploadId: string,
    eventId: string
  ): Promise<ProcessingResult> => {
    console.log(`Getting processing status for upload ${uploadId}`);

    try {
      const upload = await uploadOperations.getUpload(uploadId, eventId);
      if (!upload) {
        throw new Error("Upload not found");
      }

      // Only include metadata if all required fields are present
      const metadata = upload.metadata as PartialVideoMetadata;
      const hasAllMetadata =
        metadata &&
        typeof metadata.duration === "number" &&
        typeof metadata.width === "number" &&
        typeof metadata.height === "number" &&
        typeof metadata.codec === "string" &&
        typeof metadata.bitrate === "number" &&
        typeof metadata.fps === "number";

      return {
        id: uploadId,
        status:
          upload.status === "completed"
            ? "completed"
            : upload.status === "rejected"
            ? "failed"
            : "processing",
        metadata: hasAllMetadata ? (metadata as VideoMetadata) : undefined,
        thumbnails: upload.thumbnailUrls,
        variants: upload.variants,
        error: upload.error,
      };
    } catch (error) {
      console.error(
        `Failed to get processing status for upload ${uploadId}:`,
        error
      );
      throw error;
    }
  },

  // Cancel video processing
  cancelProcessing: async (
    uploadId: string,
    eventId: string
  ): Promise<void> => {
    console.log(`Cancelling video processing for upload ${uploadId}`);

    try {
      // Get the current upload to get the file key
      const upload = await uploadOperations.getUpload(uploadId, eventId);
      if (!upload) {
        throw new Error("Upload not found");
      }

      // Call the cancel processing Lambda
      await lambdaOperations.cancelVideoProcessing(
        uploadId,
        upload.bucket,
        upload.key
      );

      // Update upload status to cancelled
      await uploadOperations.updateUploadStatus(uploadId, eventId, "cancelled");

      console.log(`Successfully cancelled processing for upload ${uploadId}`);
    } catch (error) {
      console.error(
        `Failed to cancel processing for upload ${uploadId}:`,
        error
      );
      throw error;
    }
  },

  // Retry failed processing
  retryProcessing: async (
    uploadId: string,
    eventId: string,
    options?: ProcessingOptions
  ): Promise<ProcessingResult> => {
    console.log(`Retrying processing for upload ${uploadId}`);

    try {
      const upload = await uploadOperations.getUpload(uploadId, eventId);
      if (!upload) {
        throw new Error("Upload not found");
      }

      return await videoOperations.startProcessing(
        uploadId,
        eventId,
        upload.fileKey,
        options
      );
    } catch (error) {
      console.error(
        `Failed to retry processing for upload ${uploadId}:`,
        error
      );
      throw error;
    }
  },
};
