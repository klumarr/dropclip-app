import { useCallback } from "react";
import { useEvents } from "../contexts/EventsContext";
import { Event } from "../types/events";

export const useEventScanner = () => {
  const { isScannerOpen, setIsScannerOpen, handleScannedEvent } = useEvents();

  const handleOpenScanner = useCallback(() => {
    setIsScannerOpen(true);
  }, [setIsScannerOpen]);

  const handleCloseScanner = useCallback(() => {
    setIsScannerOpen(false);
  }, [setIsScannerOpen]);

  const handleEventDetected = useCallback(
    (eventData: Partial<Event>) => {
      handleScannedEvent(eventData);
    },
    [handleScannedEvent]
  );

  return {
    // State
    isScannerOpen,

    // Actions
    handleOpenScanner,
    handleCloseScanner,
    handleEventDetected,
  };
};
