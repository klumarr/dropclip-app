import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  styled,
  TextField,
  Grid,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  NavigateBefore,
  NavigateNext,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { createWorker } from "tesseract.js";
import { EventFormData } from "../../../../types/events";

const UploadBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  border: "2px dashed rgba(255, 255, 255, 0.1)",
  cursor: "pointer",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
}));

const PreviewImage = styled("img")({
  width: "100%",
  height: 200,
  objectFit: "cover",
  borderRadius: 8,
  marginBottom: 16,
});

interface ScannedEvent {
  name?: string;
  description?: string;
  date?: string;
  time?: string;
  endTime?: string;
  venue?: string;
  city?: string;
  country?: string;
  type?: string;
  tags?: string[];
  imageUrl?: string;
  imageFile?: File;
}

interface FlyerScannerProps {
  open: boolean;
  onEventDetected: (eventData: Partial<EventFormData>) => void;
  onClose: () => void;
}

export const FlyerScanner: React.FC<FlyerScannerProps> = ({
  open,
  onEventDetected,
  onClose,
}) => {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scannedEvents, setScannedEvents] = useState<ScannedEvent[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [editedEvent, setEditedEvent] = useState<ScannedEvent | null>(null);
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    setScanning(true);
    setProgress(0);

    try {
      const worker = await createWorker({
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(parseInt(m.progress.toString()) * 100);
          }
        },
      });

      await worker.loadLanguage("eng");
      await worker.initialize("eng");

      const newEvents: ScannedEvent[] = [];

      for (const file of fileArray) {
        const imageUrl = URL.createObjectURL(file);
        const {
          data: { text },
        } = await worker.recognize(file);

        // Extract time information
        const { time, endTime } = extractTime(text);

        const eventData: ScannedEvent = {
          name: extractTitle(text),
          date: extractDate(text),
          time,
          endTime,
          venue: extractLocation(text),
          description: text.substring(0, 200),
          type: "Other",
          imageUrl,
          imageFile: file,
        };

        console.log("Extracted event data:", { text, eventData });
        newEvents.push(eventData);
      }

      await worker.terminate();
      setScannedEvents(newEvents);
      setEditedEvent(newEvents[0]);
    } catch (error) {
      console.error("Error scanning flyers:", error);
    } finally {
      setScanning(false);
    }
  };

  // Helper functions to extract information
  const extractTitle = (text: string): string | undefined => {
    const patterns = [
      // Event name after common prefixes
      /(?:PRESENTS|FEATURING|PRESENTS:|PROUDLY PRESENTS)\s+([A-Z][^\n]+)/i,
      // Event name with common suffixes
      /([A-Z][^\n]+)(?:\s+TOUR|CONCERT|FESTIVAL|SHOW|PERFORMANCE)(?:\s|$)/i,
      // Text in all caps at start of line
      /^([A-Z][A-Z\s&]+)(?:\n|$)/m,
      // Long text without lowercase
      /(?:^|\n)([A-Z][^a-z\n]{10,})/m,
      // Text between quotes
      /"([^"]+)"/,
      // Text after common event words
      /(?:EVENT|SHOW|CONCERT|PERFORMANCE|FESTIVAL):\s+([^\n]+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        const title = match[1].trim();
        // Remove common prefixes/suffixes
        return title.replace(/^(?:THE|A|AN)\s+/i, "");
      }
    }

    // Fallback: first line if nothing else matches
    const firstLine = text.split("\n")[0].trim();
    return firstLine.length > 0 ? firstLine : "Untitled Event";
  };

  const extractDate = (text: string): string | undefined => {
    const patterns = [
      // Common date formats
      /(?:ON|DATE:?|WHEN:?)\s*(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4})/i,
      /(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4})/i,
      // ISO format
      /\b(\d{4}-\d{2}-\d{2})\b/,
      // US format
      /\b(\d{2}\/\d{2}\/\d{4})\b/,
      // UK format
      /\b(\d{2}-\d{2}-\d{4})\b/,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        const date = new Date(match[1]);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split("T")[0];
        }
      }
    }
  };

  const extractTime = (text: string): { time?: string; endTime?: string } => {
    const timePatterns = [
      // 24-hour format
      /(\d{1,2}:\d{2})(?:\s*-\s*(\d{1,2}:\d{2}))?/,
      // 12-hour format
      /(\d{1,2}(?::\d{2})?\s*(?:AM|PM))(?:\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)))?/i,
      // Time words
      /(?:FROM|STARTS?|DOORS?|OPENS?)\s*(?:@|AT)?\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/i,
    ];

    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        const startTime = match[1]?.trim();
        const endTime = match[2]?.trim();

        // Convert to 24-hour format if needed
        return {
          time: startTime ? convertTo24Hour(startTime) : undefined,
          endTime: endTime ? convertTo24Hour(endTime) : undefined,
        };
      }
    }

    return {};
  };

  const convertTo24Hour = (time: string): string => {
    const [hours, minutes] = time.split(":");
    let hour = parseInt(hours);
    const isPM = time.toLowerCase().includes("pm");
    const isAM = time.toLowerCase().includes("am");

    if (isPM && hour < 12) hour += 12;
    if (isAM && hour === 12) hour = 0;

    return `${hour.toString().padStart(2, "0")}:${
      minutes ? minutes.replace(/[^\d]/g, "") : "00"
    }`;
  };

  const extractLocation = (text: string): string | undefined => {
    const patterns = [
      // Location after keywords
      /(?:AT|VENUE|LOCATION|WHERE):\s*([^\n,]+)(?:,|\n|$)/i,
      // Address-like patterns
      /(\d+[^,\n]+(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Drive|Dr|Boulevard|Blvd)[^,\n]*)/i,
      // Venue names
      /(?:^|\n)([A-Z][^,\n]+(?:Club|Lounge|Bar|Venue|Arena|Stadium|Hall|Theatre|Theater)[^,\n]*)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        return match[1].trim();
      }
    }
  };

  const handleApprove = () => {
    if (editedEvent) {
      const formData: Partial<EventFormData> = {
        name: editedEvent.name,
        description: editedEvent.description,
        date: editedEvent.date,
        time: editedEvent.time,
        endTime: editedEvent.endTime,
        venue: editedEvent.venue,
        city: editedEvent.city,
        country: editedEvent.country,
        type: editedEvent.type as any,
        tags: editedEvent.tags,
        flyerUrl: editedEvent.imageUrl,
      };

      onEventDetected(formData);

      // Remove the approved event from the list
      const newEvents = [...scannedEvents];
      newEvents.splice(currentEventIndex, 1);

      if (newEvents.length === 0) {
        onClose();
      } else {
        setScannedEvents(newEvents);
        setCurrentEventIndex(Math.min(currentEventIndex, newEvents.length - 1));
        setEditedEvent(
          newEvents[Math.min(currentEventIndex, newEvents.length - 1)]
        );
      }
    }
  };

  const handleNavigate = (direction: "prev" | "next") => {
    const newIndex =
      direction === "prev" ? currentEventIndex - 1 : currentEventIndex + 1;
    if (newIndex >= 0 && newIndex < scannedEvents.length) {
      setCurrentEventIndex(newIndex);
      setEditedEvent(scannedEvents[newIndex]);
    }
  };

  const handleDelete = () => {
    const newEvents = [...scannedEvents];
    newEvents.splice(currentEventIndex, 1);

    if (newEvents.length === 0) {
      onClose();
    } else {
      setScannedEvents(newEvents);
      setCurrentEventIndex(Math.min(currentEventIndex, newEvents.length - 1));
      setEditedEvent(
        newEvents[Math.min(currentEventIndex, newEvents.length - 1)]
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Scan Event Flyer</DialogTitle>
      <DialogContent>
        <Box sx={{ width: "100%" }}>
          {!scannedEvents.length ? (
            <>
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                id="flyer-upload"
                onChange={handleFileUpload}
              />
              <label htmlFor="flyer-upload" style={{ width: "100%" }}>
                <UploadBox>
                  {scanning ? (
                    <Box sx={{ textAlign: "center" }}>
                      <CircularProgress
                        variant="determinate"
                        value={progress}
                      />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Scanning flyer... {progress.toFixed(0)}%
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <CloudUploadIcon sx={{ fontSize: 48, mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Upload Event Flyers
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Drop your event flyers here or click to browse
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        You can select multiple flyers
                      </Typography>
                      <Button
                        variant="contained"
                        component="span"
                        sx={{ mt: 2 }}
                        startIcon={<CloudUploadIcon />}
                      >
                        Upload Flyers
                      </Button>
                    </>
                  )}
                </UploadBox>
              </label>
            </>
          ) : (
            <Box>
              {editedEvent?.imageUrl && (
                <Box sx={{ position: "relative" }}>
                  <PreviewImage
                    src={editedEvent.imageUrl}
                    alt="Event flyer"
                    onClick={() => setIsImageExpanded(true)}
                    sx={{ cursor: "pointer" }}
                  />
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      borderRadius: 1,
                      p: 0.5,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => handleNavigate("prev")}
                      disabled={currentEventIndex === 0}
                    >
                      <NavigateBefore />
                    </IconButton>
                    <Typography sx={{ color: "white", alignSelf: "center" }}>
                      {currentEventIndex + 1} / {scannedEvents.length}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleNavigate("next")}
                      disabled={currentEventIndex === scannedEvents.length - 1}
                    >
                      <NavigateNext />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={handleDelete}
                      sx={{ ml: 2 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Box>
              )}

              {/* Image Preview Dialog */}
              <Dialog
                open={isImageExpanded}
                onClose={() => setIsImageExpanded(false)}
                maxWidth={false}
              >
                <DialogContent sx={{ p: 0 }}>
                  <Box
                    component="img"
                    src={editedEvent?.imageUrl}
                    alt="Event flyer full size"
                    sx={{
                      width: "90vw",
                      maxHeight: "90vh",
                      objectFit: "contain",
                    }}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setIsImageExpanded(false)}>
                    Close
                  </Button>
                </DialogActions>
              </Dialog>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Event Name"
                    value={editedEvent?.name || ""}
                    onChange={(e) =>
                      setEditedEvent((prev) =>
                        prev ? { ...prev, name: e.target.value } : null
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date"
                    value={editedEvent?.date || ""}
                    onChange={(e) =>
                      setEditedEvent((prev) =>
                        prev ? { ...prev, date: e.target.value } : null
                      )
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Venue"
                    value={editedEvent?.venue || ""}
                    onChange={(e) =>
                      setEditedEvent((prev) =>
                        prev ? { ...prev, venue: e.target.value } : null
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Start Time"
                    value={editedEvent?.time || ""}
                    onChange={(e) =>
                      setEditedEvent((prev) =>
                        prev ? { ...prev, time: e.target.value } : null
                      )
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="End Time"
                    value={editedEvent?.endTime || ""}
                    onChange={(e) =>
                      setEditedEvent((prev) =>
                        prev ? { ...prev, endTime: e.target.value } : null
                      )
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    value={editedEvent?.description || ""}
                    onChange={(e) =>
                      setEditedEvent((prev) =>
                        prev ? { ...prev, description: e.target.value } : null
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    <Button onClick={onClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleApprove}>
                      Approve Event
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};
