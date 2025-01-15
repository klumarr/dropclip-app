import { useState } from "react";
import { Event } from "../types/events";
import { SharePlatform } from "../components/events/creative/EventActions/types";

export const useEventActions = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInitiateDelete = async (event: Event) => {
    setSelectedEvent(event);
    setError(null);
  };

  const handleInitiateEdit = async (event: Event) => {
    setSelectedEvent(event);
    setError(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEvent) return;
    setIsLoading(true);
    setError(null);
    try {
      // Implement delete logic here
      console.log("Deleting event:", selectedEvent.id);
    } catch (err) {
      setError("Failed to delete event");
      console.error("Error deleting event:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (event: Event, platform: SharePlatform) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `${window.location.origin}/events/${event.id}`;
      switch (platform) {
        case "facebook":
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              url
            )}`,
            "_blank"
          );
          break;
        case "twitter":
          window.open(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(
              url
            )}&text=${encodeURIComponent(`Check out ${event.name}!`)}`,
            "_blank"
          );
          break;
        case "whatsapp":
          window.open(
            `https://wa.me/?text=${encodeURIComponent(
              `Check out ${event.name}! ${url}`
            )}`,
            "_blank"
          );
          break;
        case "copy":
          await navigator.clipboard.writeText(url);
          console.log("URL copied to clipboard:", url);
          break;
      }
    } catch (err) {
      setError("Failed to share event");
      console.error("Error sharing event:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    selectedEvent,
    isLoading,
    error,
    handleInitiateDelete,
    handleInitiateEdit,
    handleConfirmDelete,
    handleShare,
  };
};

export default useEventActions;
