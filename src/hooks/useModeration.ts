import { useState, useCallback, useEffect } from "react";
import { ModerationService } from "../services/moderation.service";
import { Upload, UploadStatus } from "../types/uploads";
import { useNotificationManager } from "./useNotificationManager";

export const useModeration = () => {
  const [pendingUploads, setPendingUploads] = useState<Upload[]>([]);
  const [approvedUploads, setApprovedUploads] = useState<Upload[]>([]);
  const [rejectedUploads, setRejectedUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notifyModeration } = useNotificationManager();

  const refreshUploads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pending, approved, rejected] = await Promise.all([
        ModerationService.getUploadsByStatus("pending"),
        ModerationService.getUploadsByStatus("approved"),
        ModerationService.getUploadsByStatus("rejected"),
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
          "Upload Approved",
          "Your upload has been approved and is now visible",
          { uploadId }
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
          "Upload Rejected",
          "Your upload has been rejected. Please check our content guidelines",
          { uploadId }
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
