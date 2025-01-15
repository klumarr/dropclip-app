import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  CircularProgress,
  Typography,
  Alert,
  AlertTitle,
} from "@mui/material";
import { useEvents } from "../../../contexts/EventsContext";
import { EventFormData } from "../../../types/events";
import { extractEventData } from "../../../utils/eventExtractor";
import {
  CameraAlt as CameraAltIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import {
  ExtractedEventData,
  EventExtractionError,
  MIN_CONFIDENCE_THRESHOLD,
  validateExtractedData,
} from "../../../types/extraction";

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
  const [error, setError] = useState<{
    message: string;
    details?: string[];
  } | null>(null);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setScanning(true);
      setError(null);

      try {
        // Extract event data from flyer image
        const extractedData = (await extractEventData(
          file
        )) as ExtractedEventData;

        // Check confidence scores and collect feedback
        const lowConfFields: string[] = [];
        const missingFields: string[] = [];

        // Check required fields
        if (!extractedData.name) missingFields.push("event name");
        if (!extractedData.date) missingFields.push("date");
        if (!extractedData.venue) missingFields.push("venue");

        // Check confidence scores if available
        if (extractedData.confidence) {
          if (extractedData.confidence.name < MIN_CONFIDENCE_THRESHOLD)
            lowConfFields.push("event name");
          if (extractedData.confidence.date < MIN_CONFIDENCE_THRESHOLD)
            lowConfFields.push("date");
          if (extractedData.confidence.time < MIN_CONFIDENCE_THRESHOLD)
            lowConfFields.push("time");
          if (extractedData.confidence.venue < MIN_CONFIDENCE_THRESHOLD)
            lowConfFields.push("venue");
        }

        // If there are issues, throw an error with details
        if (missingFields.length > 0 || lowConfFields.length > 0) {
          throw new EventExtractionError("Scanning Failed", {
            missingFields,
            lowConfFields,
          });
        }

        // Create partial event data
        const newEventData: Partial<EventFormData> = {
          name: extractedData.name || "Untitled Event",
          description: extractedData.description || "",
          date: extractedData.date || new Date().toISOString().split("T")[0],
          time: extractedData.time || "18:00",
          endTime: extractedData.endTime,
          venue: extractedData.venue || "",
          city: extractedData.city || "",
          country: extractedData.country || "",
          ticketLink: extractedData.ticketLink,
          flyerImage: file,
          flyerUrl: URL.createObjectURL(file),
          type: "Other",
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
        const details: string[] = [];

        // Add base error message
        details.push(
          "We couldn't properly read all the event details from this image."
        );

        // Add specific field issues if available
        if (error instanceof EventExtractionError && error.details) {
          const { missingFields, lowConfFields } = error.details;

          if (missingFields?.length > 0) {
            details.push(
              `Missing required fields: ${missingFields.join(", ")}`
            );
          }

          if (lowConfFields?.length > 0) {
            details.push(
              `Low confidence in detecting: ${lowConfFields.join(", ")}`
            );
          }
        }

        // Add helpful tips
        details.push("");
        details.push("Tips for better results:");
        details.push("• Use a high-quality, well-lit image");
        details.push("• Ensure text is clearly visible and not blurry");
        details.push("• Capture the entire flyer in frame");
        details.push("• Avoid complex backgrounds");
        details.push("");
        details.push(
          "You can try again with a different image or create the event manually."
        );

        setError({
          message: "Scanning Failed",
          details: details,
        });
      } finally {
        setScanning(false);
      }
    },
    [onEventDetected, onClose]
  );

  const handleCreateManually = () => {
    onClose();
    // This will open the create event dialog
    onEventDetected({});
  };

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
                py: 4,
              }}
            >
              <CircularProgress size={40} thickness={4} />
              <Typography variant="body1" color="text.secondary">
                Scanning flyer...
              </Typography>
            </Box>
          ) : error ? (
            <Box sx={{ width: "100%", maxWidth: 360, mx: "auto" }}>
              <Alert
                severity="warning"
                sx={{
                  backgroundColor: "#1a1a1a",
                  color: "#fff",
                  border: "none",
                  borderRadius: 1,
                  p: 2.5,
                  maxWidth: 360,
                  mx: "auto",
                  "& .MuiAlert-icon": {
                    color: "#ff9800",
                    alignItems: "flex-start",
                    marginTop: "2px",
                  },
                }}
              >
                <Box sx={{ width: "100%", textAlign: "center" }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {error.message}
                  </Typography>
                  {error.details && (
                    <Box>
                      {error.details.map((detail, index) => (
                        <Typography
                          key={index}
                          variant="body2"
                          sx={{
                            mb: 1,
                            fontSize: "0.875rem",
                            color: "rgba(255, 255, 255, 0.87)",
                          }}
                        >
                          {detail}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              </Alert>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  mt: 2,
                  maxWidth: 360,
                  mx: "auto",
                  px: 2,
                  "& .MuiButton-root": {
                    height: 36,
                    fontSize: "0.875rem",
                    textTransform: "none",
                    borderRadius: 18,
                    lineHeight: 1,
                    py: 0,
                    px: 2,
                    "& .MuiButton-startIcon": {
                      margin: "0 4px 0 -4px",
                    },
                  },
                }}
              >
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="flyer-upload"
                  type="file"
                  onChange={handleFileSelect}
                />
                <label htmlFor="flyer-upload" style={{ flex: 1 }}>
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    startIcon={<CameraAltIcon sx={{ fontSize: 18 }} />}
                    sx={{
                      color: "#9c27b0",
                      borderColor: "#9c27b0",
                    }}
                  >
                    Try Another
                  </Button>
                </label>
                <Box sx={{ flex: 1 }}>
                  <Button
                    variant="contained"
                    onClick={handleCreateManually}
                    fullWidth
                    startIcon={<EditIcon sx={{ fontSize: 18 }} />}
                    sx={{
                      backgroundColor: "#9c27b0",
                      "&:hover": {
                        backgroundColor: "#7b1fa2",
                      },
                    }}
                  >
                    Create
                  </Button>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                py: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
              }}
            >
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="flyer-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="flyer-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CameraAltIcon />}
                  sx={{
                    minWidth: 160,
                    height: 44,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 500,
                    boxShadow: 2,
                    "&:hover": {
                      boxShadow: 4,
                    },
                  }}
                >
                  Select Flyer Image
                </Button>
              </label>

              <Typography
                variant="body1"
                color="text.secondary"
                align="center"
                sx={{
                  maxWidth: 320,
                  fontSize: "0.9rem",
                  lineHeight: 1.5,
                }}
              >
                Upload a clear image of your event flyer to automatically
                extract event details
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      {!scanning && !error && (
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={onClose}
            sx={{
              minWidth: 100,
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateManually}
            variant="contained"
            sx={{
              minWidth: 140,
              textTransform: "none",
              ml: 2,
            }}
          >
            Create Manually
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};
