import { useState, useCallback } from "react";
import { notificationService } from "../services/notification.service";
import { NotificationType } from "../types/notification.types";
import { useAuth } from "../contexts/AuthContext";

export const useDownloadFile = () => {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const downloadFile = useCallback(
    async (url: string, filename: string) => {
      if (!user?.id) {
        setError(new Error("User must be authenticated to download"));
        return;
      }

      setDownloading(true);
      setError(null);

      try {
        // Create a notification for the download start
        await notificationService.createNotification({
          userId: user.id,
          type: NotificationType.DOWNLOAD,
          status: "unread",
          message: `Starting download: ${filename}`,
          metadata: {
            url,
            filename,
          },
        });

        // Fetch the file
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Download failed");
        }

        // Create a blob from the response
        const blob = await response.blob();

        // Create a download link and trigger it
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        // Create a success notification
        await notificationService.createNotification({
          userId: user.id,
          type: NotificationType.DOWNLOAD,
          status: "unread",
          message: `Successfully downloaded: ${filename}`,
          metadata: {
            url,
            filename,
            success: true,
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Download failed";
        setError(new Error(errorMessage));

        // Create an error notification
        await notificationService.createNotification({
          userId: user.id,
          type: NotificationType.DOWNLOAD,
          status: "unread",
          message: `Failed to download: ${filename}`,
          metadata: {
            url,
            filename,
            error: errorMessage,
          },
        });

        throw error;
      } finally {
        setDownloading(false);
      }
    },
    [user?.id]
  );

  return {
    downloadFile,
    downloading,
    error,
  };
};
