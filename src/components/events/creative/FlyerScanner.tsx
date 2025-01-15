import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useEvents } from "../../../contexts/EventsContext";
import { EventFormData } from "../../../types/events";
import { extractEventData } from "../../../utils/eventExtractor";

export interface FlyerScannerProps {
  open: boolean;
  onClose: () => void;
  onEventDetected: (eventData: Partial<EventFormData>) => void;
}

export const FlyerScanner: React.FC<FlyerScannerProps> = ({
  open,
  onClose,
  onEventDetected,
}) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setScanning(true);
      setError(null);

      try {
        // Extract event data from flyer image
        const extractedData = await extractEventData(file);

        // Create partial event data
        const newEventData: Partial<EventFormData> = {
          name: extractedData.name || "Untitled Event",
          description: extractedData.description || "",
          date: extractedData.date || new Date().toISOString().split("T")[0],
          time: extractedData.time || "18:00",
          endTime: extractedData.endTime,
          venue: extractedData.venue || "",
          city: "", // Will need to be filled in by user
          country: "", // Will need to be filled in by user
          ticketLink: extractedData.ticketLink,
          flyerImage: file,
          flyerUrl: URL.createObjectURL(file),
          type: "Other", // Default type
          uploadConfig: {
            enabled: false,
            startDate: "",
            endDate: "",
            startTime: "",
            endTime: "",
            maxFileSize: 100,
            allowedTypes: ["video/mp4", "video/quicktime"],
            maxFiles: 1,
          },
        };

        onEventDetected(newEventData);
        onClose();
      } catch (error) {
        console.error("Error scanning flyer:", error);
        setError(
          "Failed to scan flyer. Please try again or enter event details manually."
        );
      } finally {
        setScanning(false);
      }
    },
    [onEventDetected, onClose]
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Scan Event Flyer</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 3, textAlign: "center" }}>
          {scanning ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <CircularProgress />
              <Typography>Scanning flyer...</Typography>
            </Box>
          ) : (
            <>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="flyer-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="flyer-upload">
                <Button variant="contained" component="span">
                  Select Flyer Image
                </Button>
              </label>
            </>
          )}

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Upload a clear image of your event flyer to automatically extract
            event details
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
