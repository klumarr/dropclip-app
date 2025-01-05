import { useState } from "react";
import { Event } from "../types/events";
import { useEvents } from "../contexts/EventsContext";
import { defaultUploadConfig } from "../types/events";

export const useEventActions = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { setIsCreateDialogOpen, setNewEvent } = useEvents();

  const handleInitiateCreate = () => {
    setNewEvent({
      title: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "",
      endTime: "",
      location: "",
      description: "",
      imageUrl: "",
      ticketLink: "",
      uploadConfig: defaultUploadConfig,
    });
    setIsCreateDialogOpen(true);
  };

  const handleInitiateEdit = (event: Event) => {
    setNewEvent(event);
    setIsCreateDialogOpen(true);
  };

  const handleInitiateDelete = (event: Event) => {
    setEventToDelete(event);
  };

  const handleShare = async (event: Event, platform: string) => {
    try {
      let shareUrl = "";
      const eventUrl = `${window.location.origin}/events/${event.id}`;
      const text = `Check out this event: ${event.title}`;

      switch (platform) {
        case "facebook":
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            eventUrl
          )}`;
          break;
        case "twitter":
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            text
          )}&url=${encodeURIComponent(eventUrl)}`;
          break;
        case "whatsapp":
          shareUrl = `https://wa.me/?text=${encodeURIComponent(
            `${text} ${eventUrl}`
          )}`;
          break;
        case "email":
          shareUrl = `mailto:?subject=${encodeURIComponent(
            event.title
          )}&body=${encodeURIComponent(`${text} ${eventUrl}`)}`;
          break;
        case "copy":
          await navigator.clipboard.writeText(eventUrl);
          return;
      }

      if (shareUrl) {
        window.open(shareUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("Error sharing event:", error);
      setError("Failed to share event");
    }
  };

  return {
    selectedEvent,
    eventToDelete,
    isLoading,
    error,
    handleInitiateCreate,
    handleInitiateEdit,
    handleInitiateDelete,
    handleShare,
  };
};
