import { useState } from "react";
import { Event } from "../types/events";
import { SharePlatform } from "../types/share";
import { generateEventDeepLink } from "../utils/deepLinks";

export const useEventActions = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShareClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setAnchorEl(null);
  };

  const handleShare = async (event: Event, platform: SharePlatform) => {
    try {
      setIsLoading(true);
      setError(null);
      const shareUrl = generateEventDeepLink(event);

      // Platform-specific sharing logic here
      console.log(`Sharing event ${event.id} on ${platform}:`, shareUrl);

      return shareUrl;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to share event";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiateDelete = async (event: Event) => {
    setSelectedEvent(event);
    // Additional delete initialization logic here
  };

  const handleConfirmDelete = async () => {
    if (!selectedEvent) return;
    try {
      setIsLoading(true);
      setError(null);
      // Delete logic here
      console.log("Deleting event:", selectedEvent.id);
      setSelectedEvent(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete event";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiateEdit = async (event: Event) => {
    setSelectedEvent(event);
    // Additional edit initialization logic here
  };

  return {
    selectedEvent,
    isLoading,
    error,
    anchorEl,
    handleShareClick,
    handleShareClose,
    handleShare,
    handleInitiateDelete,
    handleInitiateEdit,
    handleConfirmDelete,
  };
};

export default useEventActions;
