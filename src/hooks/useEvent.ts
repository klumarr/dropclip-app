import { useState, useEffect } from "react";
import { Event } from "../types/events";
import { eventOperations } from "../services/eventsService";

interface UseEventReturn {
  event: Event | null;
  loading: boolean;
  error: Error | null;
}

export const useEvent = (id?: string): UseEventReturn => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const eventData = await eventOperations.getEventById(id);
        setEvent(eventData);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch event")
        );
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  return { event, loading, error };
};
