import { useState, useCallback, useEffect } from "react";
import { eventsService } from "../services/eventsService";
import { useAuth } from "../contexts/AuthContext";
import { Event } from "../types/events.types";

export const useSaveEvent = (eventId: string) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if event is saved on mount and when eventId changes
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!user?.id || !eventId) return;

      try {
        const savedEvents = await eventsService.getSavedEvents();
        setIsSaved(savedEvents.some((event) => event.id === eventId));
      } catch (err) {
        console.error("Error checking saved status:", err);
        setError(
          err instanceof Error ? err.message : "Failed to check saved status"
        );
      }
    };

    checkSavedStatus();
  }, [user?.id, eventId]);

  const toggleSave = useCallback(
    async (event: Event) => {
      if (!user?.id || !event?.id) {
        setError("User must be logged in to save events");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        if (isSaved) {
          await eventsService.unsaveEvent(event.id);
          setIsSaved(false);
        } else {
          await eventsService.saveEvent(event.id);
          setIsSaved(true);
        }
      } catch (err) {
        console.error("Error toggling save:", err);
        setError(
          err instanceof Error ? err.message : "Failed to save/unsave event"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, isSaved]
  );

  return {
    isSaved,
    isLoading,
    error,
    toggleSave,
  };
};
