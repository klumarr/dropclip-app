import { useState } from "react";
import { Event } from "../types/events";
import { useAuth } from "../contexts/AuthContext";

const useSaveEvent = (eventId: string) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const toggleSave = async (event: Event) => {
    if (!user) {
      setError("Please log in to save events");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement actual save/unsave functionality
      setIsSaved(!isSaved);
      console.log("Toggled save state for event:", eventId);
    } catch (error) {
      setError("Failed to save event");
    } finally {
      setIsLoading(false);
    }
  };

  return { isSaved, isLoading, error, toggleSave };
};

export default useSaveEvent;
