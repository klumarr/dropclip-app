import { useState, useCallback, useEffect } from "react";
import { ModerationService } from "../services/moderation.service";
import { Upload, UploadStatus } from "../types/uploads";
import { useNotificationManager } from "./useNotificationManager";
import { NotificationType } from "../types/notification.types";

export const useModeration = () => {
  const [pendingUploads, setPendingUploads] = useState<Upload[]>([]);
  const [approvedUploads, setApprovedUploads] = useState<Upload[]>([]);
  const [rejectedUploads, setRejectedUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createNotification } = useNotificationManager();

  const notifyModeration = useCallback(
    async (
      uploadId: string,
      status: UploadStatus.APPROVED | UploadStatus.REJECTED,
      message?: string
    ) => {
      const type =
        status === UploadStatus.APPROVED
          ? NotificationType.CONTENT_APPROVED
          : NotificationType.CONTENT_REJECTED;

      await createNotification({
        type,
        status: "unread",
        message: message || `Upload ${uploadId} has been ${status}`,
        metadata: {
          uploadId,
          status,
        },
      });
    },
    [createNotification]
  );

  const refreshUploads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pending, approved, rejected] = await Promise.all([
        ModerationService.getUploadsByStatus(UploadStatus.PENDING),
        ModerationService.getUploadsByStatus(UploadStatus.APPROVED),
        ModerationService.getUploadsByStatus(UploadStatus.REJECTED),
      ]);
      setPendingUploads(pending);
      setApprovedUploads(approved);
      setRejectedUploads(rejected);
    } catch (err) {
      setError("Failed to fetch uploads");
      console.error("Error fetching uploads:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const approveUpload = useCallback(
    async (uploadId: string) => {
      setError(null);
      try {
        await ModerationService.approveUpload(uploadId);
        notifyModeration(
          uploadId,
          UploadStatus.APPROVED,
          "Your upload has been approved and is now visible"
        );
        await refreshUploads();
      } catch (err) {
        setError("Failed to approve upload");
        console.error("Error approving upload:", err);
      }
    },
    [refreshUploads, notifyModeration]
  );

  const rejectUpload = useCallback(
    async (uploadId: string) => {
      setError(null);
      try {
        await ModerationService.rejectUpload(uploadId);
        notifyModeration(
          uploadId,
          UploadStatus.REJECTED,
          "Your upload has been rejected. Please check our content guidelines"
        );
        await refreshUploads();
      } catch (err) {
        setError("Failed to reject upload");
        console.error("Error rejecting upload:", err);
      }
    },
    [refreshUploads, notifyModeration]
  );

  const downloadUpload = useCallback(async (uploadId: string) => {
    setError(null);
    try {
      const url = await ModerationService.generateDownloadUrl(uploadId);
      window.open(url, "_blank");
    } catch (err) {
      setError("Failed to download upload");
      console.error("Error downloading upload:", err);
    }
  }, []);

  useEffect(() => {
    refreshUploads();
  }, [refreshUploads]);

  return {
    pendingUploads,
    approvedUploads,
    rejectedUploads,
    loading,
    error,
    approveUpload,
    rejectUpload,
    downloadUpload,
    refreshUploads,
  };
};
