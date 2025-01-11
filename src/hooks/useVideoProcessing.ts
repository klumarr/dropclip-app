import { useState, useEffect, useCallback } from "react";
import {
  videoOperations,
  ProcessingResult,
  VideoMetadata,
} from "../services/video.service";
import { notificationService } from "../services/notification.service";
import { NotificationType } from "../types/notification.types";

interface ProcessingState {
  status: "idle" | "processing" | "completed" | "failed";
  progress: number;
  metadata?: VideoMetadata;
  thumbnails?: string[];
  variants?: Array<{
    quality: string;
    url: string;
  }>;
  error?: string;
}

export const useVideoProcessing = (uploadId: string, eventId: string) => {
  const [state, setState] = useState<ProcessingState>({
    status: "idle",
    progress: 0,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const startProcessing = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, status: "processing", progress: 0 }));

      // Start the processing pipeline
      const result = await videoOperations.startProcessing(
        uploadId,
        eventId,
        "",
        {
          generateThumbnails: true,
          thumbnailCount: 3,
          extractMetadata: true,
        }
      );

      if (result.status === "failed") {
        throw new Error(result.error || "Processing failed");
      }

      // Update state with initial processing result
      setState((prev) => ({
        ...prev,
        status: "processing",
        progress: 10,
        metadata: result.metadata,
        thumbnails: result.thumbnails,
        variants: result.variants,
      }));

      // Notify that processing has started
      await notificationService.createNotification({
        userId: result.id, // This should be the uploader's ID
        type: NotificationType.UPLOAD_COMPLETE,
        status: "unread",
        message:
          "Your video is being processed. We'll notify you when it's ready.",
        metadata: { uploadId, eventId },
      });
    } catch (error) {
      console.error("Failed to start processing:", error);
      setState((prev) => ({
        ...prev,
        status: "failed",
        error:
          error instanceof Error ? error.message : "Failed to start processing",
      }));
    }
  }, [uploadId, eventId]);

  const checkStatus = useCallback(async () => {
    try {
      const result = await videoOperations.getProcessingStatus(
        uploadId,
        eventId
      );

      setState((prev) => ({
        ...prev,
        status: result.status,
        metadata: result.metadata,
        thumbnails: result.thumbnails,
        variants: result.variants,
        error: result.error,
        progress: result.status === "completed" ? 100 : prev.progress,
      }));

      // If processing completed, update preview URL
      if (
        result.status === "completed" &&
        result.variants &&
        result.variants.length > 0
      ) {
        // Use the highest quality variant for preview
        setPreviewUrl(result.variants[0].url);
      }
    } catch (error) {
      console.error("Failed to check processing status:", error);
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Failed to check status",
      }));
    }
  }, [uploadId, eventId]);

  const retryProcessing = useCallback(async () => {
    try {
      setState((prev) => ({
        ...prev,
        status: "processing",
        progress: 0,
        error: undefined,
      }));

      const result = await videoOperations.retryProcessing(uploadId, eventId);

      if (result.status === "failed") {
        throw new Error(result.error || "Retry failed");
      }

      setState((prev) => ({
        ...prev,
        status: "processing",
        progress: 10,
        metadata: result.metadata,
        thumbnails: result.thumbnails,
        variants: result.variants,
      }));
    } catch (error) {
      console.error("Failed to retry processing:", error);
      setState((prev) => ({
        ...prev,
        status: "failed",
        error:
          error instanceof Error ? error.message : "Failed to retry processing",
      }));
    }
  }, [uploadId, eventId]);

  const cancelProcessing = useCallback(async () => {
    try {
      await videoOperations.cancelProcessing(uploadId, eventId);
      setState((prev) => ({
        ...prev,
        status: "idle",
        progress: 0,
        error: undefined,
      }));
    } catch (error) {
      console.error("Failed to cancel processing:", error);
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : "Failed to cancel processing",
      }));
    }
  }, [uploadId, eventId]);

  // Poll for status updates when processing is in progress
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (state.status === "processing") {
      intervalId = setInterval(checkStatus, 5000); // Check every 5 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [state.status, checkStatus]);

  return {
    state,
    previewUrl,
    actions: {
      startProcessing,
      retryProcessing,
      cancelProcessing,
      checkStatus,
    },
  };
};
