import { useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useDownloadFile } from "./useDownloadFile";
import { getDownloadUrl } from "../services/download.service";

interface DownloadOptions {
  quality: string;
  forceDownload?: boolean;
  onSuccess?: () => void;
}

export const useDownload = (uploadId: string, eventId: string) => {
  const [downloadState, setDownloadState] = useState<{
    status: "idle" | "preparing" | "downloading" | "completed" | "failed";
    progress: { downloaded: number; total: number };
    error: string | null;
  }>({
    status: "idle",
    progress: { downloaded: 0, total: 0 },
    error: null,
  });

  const { user } = useAuth();
  const { downloadFile } = useDownloadFile();

  const startDownload = useCallback(
    async (options: DownloadOptions) => {
      if (!user?.id) {
        setDownloadState((prev) => ({
          ...prev,
          status: "failed",
          error: "User must be authenticated to download",
        }));
        return;
      }

      try {
        setDownloadState((prev) => ({ ...prev, status: "preparing" }));

        // Get download URL
        const { url, filename } = await getDownloadUrl(
          uploadId,
          eventId,
          options.quality
        );

        setDownloadState((prev) => ({
          ...prev,
          status: "downloading",
          progress: { downloaded: 0, total: 100 },
        }));

        // Perform download
        await downloadFile(url, filename);

        setDownloadState((prev) => ({
          ...prev,
          status: "completed",
          progress: { downloaded: 100, total: 100 },
        }));

        options.onSuccess?.();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Download failed";
        setDownloadState((prev) => ({
          ...prev,
          status: "failed",
          error: errorMessage,
        }));
      }
    },
    [user?.id, uploadId, eventId, downloadFile]
  );

  const cancelDownload = useCallback(() => {
    setDownloadState({
      status: "idle",
      progress: { downloaded: 0, total: 0 },
      error: null,
    });
  }, []);

  return {
    state: downloadState,
    actions: {
      startDownload,
      cancelDownload,
    },
  };
};
