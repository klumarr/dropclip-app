import { useState } from "react";
import { useEvents } from "../contexts/EventsContext";
import { Event, defaultUploadConfig } from "../types/events";
import { SharePlatform } from "../types/share";

export const useEventActions = () => {
  const {
    selectedEvent,
    handleDeleteEvent,
    setEventToDelete,
    setSelectedEvent,
    setIsCreateDialogOpen,
    setNewEvent,
  } = useEvents();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInitiateEdit = (event: Event) => {
    setSelectedEvent(event);
    setNewEvent({
      title: event.title,
      date: event.date,
      startTime: event.startTime || "",
      endTime: event.endTime || "",
      location: event.location,
      description: event.description || "",
      ticketLink: event.ticketLink || "",
      imageUrl: event.imageUrl || "",
      isAutomatic: event.isAutomatic || false,
      uploadConfig: event.uploadConfig || {
        enabled: false,
        allowedTypes: ["image/*", "video/*"],
        maxFileSize: 100,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        startTime: "",
        endTime: "",
      },
    });
    setIsCreateDialogOpen(true);
  };

  const handleInitiateDelete = (event: Event) => {
    setEventToDelete(event);
  };

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await handleDeleteEvent();
    } catch (err) {
      setError("Failed to delete event");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (event: Event, platform: SharePlatform) => {
    const eventUrl = `${window.location.origin}/events/${event.id}`;
    const title = event.title;
    const text = `Check out this event: ${title}`;

    try {
      switch (platform) {
        case "facebook":
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              eventUrl
            )}`,
            "_blank"
          );
          break;
        case "twitter":
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(
              text
            )}&url=${encodeURIComponent(eventUrl)}`,
            "_blank"
          );
          break;
        case "whatsapp":
          window.open(
            `https://wa.me/?text=${encodeURIComponent(text + " " + eventUrl)}`,
            "_blank"
          );
          break;
        case "email":
          window.location.href = `mailto:?subject=${encodeURIComponent(
            title
          )}&body=${encodeURIComponent(text + "\n\n" + eventUrl)}`;
          break;
        case "copy":
          await navigator.clipboard.writeText(eventUrl);
          break;
      }
    } catch (err) {
      console.error("Error sharing event:", err);
      throw err;
    }
  };

  return {
    selectedEvent,
    isLoading,
    error,
    handleInitiateEdit,
    handleInitiateDelete,
    handleConfirmDelete,
    handleShare,
  };
};
