import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useEvents } from "../../../contexts/EventsContext";
import { Event, defaultUploadConfig } from "../../../types/events";

interface FlyerScannerProps {
  open: boolean;
  onClose: () => void;
}

const FlyerScanner: React.FC<FlyerScannerProps> = ({ open, onClose }) => {
  const { setNewEvent, setIsCreateDialogOpen } = useEvents();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files?.[0]) return;

    const file = event.target.files[0];
    setIsScanning(true);
    setError(null);

    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("flyer", file);

      // Send the file to your OCR service
      const response = await fetch("YOUR_OCR_ENDPOINT", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to scan flyer");
      }

      const data = await response.json();

      // Set the extracted data in the form
      setNewEvent({
        title: data.title || "",
        date: data.date || new Date().toISOString().split("T")[0],
        startTime: data.startTime || "",
        endTime: data.endTime || "",
        location: data.location || "",
        description: data.description || "",
        ticketLink: data.ticketLink || "",
        imageUrl: URL.createObjectURL(file),
        isAutomatic: false,
        uploadConfig: defaultUploadConfig,
      });

      // Close the scanner and open the create dialog
      onClose();
      setIsCreateDialogOpen(true);
    } catch (error) {
      console.error("Error scanning flyer:", error);
      setError(
        "Failed to scan flyer. Please try again or create event manually."
      );
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Scan Event Flyer</DialogTitle>
      <DialogContent>
        {isScanning ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 4,
            }}
          >
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Scanning flyer...</Typography>
          </Box>
        ) : (
          <Box sx={{ py: 2 }}>
            <Typography gutterBottom>
              Upload a flyer image to automatically extract event details.
            </Typography>
            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mt: 2 }}
            >
              Select Flyer Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileSelect}
              />
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FlyerScanner;
