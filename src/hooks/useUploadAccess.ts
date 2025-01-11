import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { uploadLinkService } from "../services/uploadLink.service";
import { useFollowStatus } from "./useFollowStatus";
import { useAttendanceStatus } from "./useAttendanceStatus";

interface UploadAccess {
  hasAccess: boolean;
  isLoading: boolean;
  error: string | null;
  uploadLink: string | null;
  remainingUploads: number | null;
  checkAccess: () => Promise<void>;
}

export const useUploadAccess = (
  eventId: string,
  creativeId: string
): UploadAccess => {
  const { user } = useAuth();
  const { isFollowing } = useFollowStatus(creativeId);
  const { isAttending } = useAttendanceStatus(eventId);
  const [uploadLink, setUploadLink] = useState<string | null>(null);
  const [remainingUploads, setRemainingUploads] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAccess = useCallback(async () => {
    if (!user?.id) {
      setError("Please sign in to access uploads");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if user already has an active link
      const existingLinks = await uploadLinkService.getFanEventLinks(
        user.id,
        eventId
      );
      const activeLink = existingLinks.find(
        (link) => link.isActive && new Date(link.expiresAt) > new Date()
      );

      if (activeLink) {
        setUploadLink(activeLink.id);
        setRemainingUploads(activeLink.maxUploads - activeLink.currentUploads);
        return;
      }

      // If user meets requirements, generate a new link
      if (isFollowing && isAttending) {
        const { link, error } = await uploadLinkService.autoGenerateLink(
          user.id,
          eventId,
          creativeId
        );

        if (error) {
          setError(error);
          return;
        }

        if (link) {
          setUploadLink(link.id);
          setRemainingUploads(link.maxUploads);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to check upload access"
      );
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, eventId, creativeId, isFollowing, isAttending]);

  // Check access when requirements change
  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  return {
    hasAccess:
      !!uploadLink && remainingUploads !== null && remainingUploads > 0,
    isLoading,
    error,
    uploadLink,
    remainingUploads,
    checkAccess,
  };
};

export default useUploadAccess;
