import { useState, useCallback } from "react";
import { downloadService, DownloadError } from "../services/download.service";
import { notificationService } from "../services/notification.service";

interface DownloadState {
  status: "idle" | "preparing" | "downloading" | "completed" | "failed";
  progress: {
    downloaded: number;
    total: number;
  };
  error?: string;
}

interface DownloadOptions {
  quality?: string;
  forceDownload?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useDownload = (uploadId: string, eventId: string) => {
  const [state, setState] = useState<DownloadState>({
    status: "idle",
    progress: {
      downloaded: 0,
      total: 0,
    },
  });

  const startDownload = useCallback(
    async (options: DownloadOptions = {}) => {
      try {
        setState((prev) => ({
          ...prev,
          status: "preparing",
          error: undefined,
        }));

        // Get the download URL
        const downloadUrl = await downloadService.getDownloadUrl(
          uploadId,
          eventId,
          {
            quality: options.quality,
            forceDownload: options.forceDownload,
          }
        );

        // Create an anchor element to trigger the download
        const link = document.createElement("a");
        link.href = downloadUrl;
        if (options.forceDownload) {
          link.download = ""; // Browser will use the filename from Content-Disposition
        }
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setState((prev) => ({
          ...prev,
          status: "completed",
        }));

        // Notify about successful download
        await notificationService.createNotification({
          userId: "current-user", // This should be replaced with actual user ID
          type: "download",
          status: "unread",
          title: "Download Complete",
          message: "Your video has been downloaded successfully.",
          metadata: { uploadId, eventId },
        });

        options.onSuccess?.();
      } catch (error) {
        console.error("Download failed:", error);

        setState((prev) => ({
          ...prev,
          status: "failed",
          error:
            error instanceof DownloadError
              ? error.message
              : "Failed to download video",
        }));

        options.onError?.(
          error instanceof Error ? error : new Error("Download failed")
        );
      }
    },
    [uploadId, eventId]
  );

  const checkProgress = useCallback(async () => {
    try {
      const progress = await downloadService.getDownloadProgress(
        uploadId,
        eventId
      );

      setState((prev) => ({
        ...prev,
        progress,
        status:
          progress.downloaded === progress.total ? "completed" : "downloading",
      }));
    } catch (error) {
      console.error("Failed to check download progress:", error);
    }
  }, [uploadId, eventId]);

  const cancelDownload = useCallback(async () => {
    try {
      await downloadService.cancelDownload(uploadId, eventId);
      setState((prev) => ({
        ...prev,
        status: "idle",
        progress: { downloaded: 0, total: 0 },
        error: undefined,
      }));
    } catch (error) {
      console.error("Failed to cancel download:", error);
    }
  }, [uploadId, eventId]);

  return {
    state,
    actions: {
      startDownload,
      checkProgress,
      cancelDownload,
    },
  };
};
