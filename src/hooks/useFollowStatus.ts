import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { followService } from "../services/follow.service";

export const useFollowStatus = (creativeId: string) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check initial follow status
  const checkFollowStatus = useCallback(async () => {
    if (!user?.id) return;
    try {
      const status = await followService.checkFollowStatus(user.id, creativeId);
      setIsFollowing(status);
    } catch (err) {
      console.error("Error checking follow status:", err);
    }
  }, [user?.id, creativeId]);

  // Load initial status
  useEffect(() => {
    checkFollowStatus();
  }, [checkFollowStatus]);

  // Toggle follow status
  const toggleFollow = async () => {
    if (!user?.id) {
      setError("Please sign in to follow creators");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isFollowing) {
        await followService.unfollowCreative(user.id, creativeId);
        setIsFollowing(false);
      } else {
        await followService.followCreative(user.id, creativeId);
        setIsFollowing(true);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update follow status"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    isFollowing,
    isLoading,
    error,
    toggleFollow,
    clearError,
    checkFollowStatus,
  };
};

export default useFollowStatus;
