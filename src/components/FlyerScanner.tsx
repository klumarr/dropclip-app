import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import EditIcon from "@mui/icons-material/Edit";
import { EventFormData } from "../types/events";
import {
  extractEventData,
  validateExtractedData,
} from "../utils/eventExtractor";
import { MIN_CONFIDENCE_THRESHOLD } from "../types/extraction";

interface FlyerScannerProps {
  onScanComplete: (eventData: Partial<EventFormData>) => void;
  onScanError: () => void;
}

const FlyerScanner: React.FC<FlyerScannerProps> = ({
  onScanComplete,
  onScanError,
}) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleScan = async (file: File) => {
    try {
      setScanning(true);
      setError(null);

      const eventData = await extractEventData(file);

      // Check if extraction was successful
      if (!eventData || !validateExtractedData(eventData)) {
        setError(
          "We couldn't properly read the event details from this image. This could be due to:"
        );
        console.log("Event extraction failed - Invalid or missing data");
        return;
      }

      // Check confidence scores
      const lowConfidenceFields = [];
      if (eventData.confidence) {
        if (eventData.confidence.name < MIN_CONFIDENCE_THRESHOLD)
          lowConfidenceFields.push("title");
        if (eventData.confidence.date < MIN_CONFIDENCE_THRESHOLD)
          lowConfidenceFields.push("date");
        if (eventData.confidence.time < MIN_CONFIDENCE_THRESHOLD)
          lowConfidenceFields.push("time");
        if (eventData.confidence.venue < MIN_CONFIDENCE_THRESHOLD)
          lowConfidenceFields.push("location");
      }

      if (lowConfidenceFields.length > 0) {
        setError(
          `Some fields couldn't be read clearly: ${lowConfidenceFields.join(
            ", "
          )}`
        );
        console.log(
          "Event extraction completed with low confidence fields:",
          lowConfidenceFields
        );
      } else {
        onScanComplete(eventData);
      }
    } catch (err) {
      console.error("Scan error:", err);
      setError("An error occurred while scanning the flyer");
    } finally {
      setScanning(false);
    }
  };

  const handleCreateManually = () => {
    navigate("/events/create");
  };

  return (
    <Box sx={{ textAlign: "center", p: 3 }}>
      <input
        accept="image/*"
        style={{ display: "none" }}
        id="flyer-upload"
        type="file"
        onChange={(e) => e.target.files?.[0] && handleScan(e.target.files[0])}
        disabled={scanning}
      />

      <label htmlFor="flyer-upload">
        <Button
          variant="contained"
          component="span"
          disabled={scanning}
          startIcon={<CameraAltIcon />}
        >
          {scanning ? "Scanning..." : "Scan Flyer"}
        </Button>
      </label>

      {error && (
        <Box sx={{ mt: 2, color: "error.main" }}>
          <Typography variant="body1" gutterBottom>
            {error}
          </Typography>
          {error.includes("couldn't read") && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Common reasons for scanning issues:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <ErrorOutlineIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText primary="Image quality is too low or blurry" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ErrorOutlineIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText primary="Text is not clearly visible or too small" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ErrorOutlineIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText primary="Image contains complex backgrounds or patterns" />
                </ListItem>
              </List>
            </Box>
          )}
          <Button
            variant="outlined"
            onClick={handleCreateManually}
            startIcon={<EditIcon />}
            sx={{ mt: 2 }}
          >
            Create Event Manually
          </Button>
        </Box>
      )}

      {scanning && <CircularProgress sx={{ mt: 2 }} />}
    </Box>
  );
};

export default FlyerScanner;
