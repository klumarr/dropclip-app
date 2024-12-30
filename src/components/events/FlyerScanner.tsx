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
  title?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
  ticketLink?: string;
  imageUrl?: string;
  imageFile?: File;
}

interface FlyerScannerProps {
  onEventDetected: (eventData: ScannedEvent) => void;
  onClose: () => void;
}

const FlyerScanner = ({ onEventDetected, onClose }: FlyerScannerProps) => {
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
        const { startTime, endTime } = extractTime(text);

        const eventData: ScannedEvent = {
          title: extractTitle(text),
          date: extractDate(text),
          startTime,
          endTime,
          location: extractLocation(text),
          description: text.substring(0, 200),
          ticketLink: extractTicketLink(text),
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
      // Full date formats
      /(?:\b\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?)\s*,?\s*\d{4}/i,
      // Date with slashes or dashes
      /\b\d{1,2}[-/]\d{1,2}[-/]\d{4}\b/,
      // Date at start of line
      /^.*?(\d{1,2}[-/\s](?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[-/\s]\d{4})/im,
      // Date after keywords
      /(?:DATE|WHEN):\s*(\d{1,2}[-/\s](?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[-/\s]\d{4})/i,
      // Date in parentheses
      /\((\d{1,2}[-/\s](?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[-/\s]\d{4})\)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          const date = new Date(match[0]);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split("T")[0];
          }
        } catch (error) {
          console.error("Error parsing date:", error);
        }
      }
    }

    // Try to find individual date components
    const monthPattern =
      /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)/i;
    const dayPattern = /\b\d{1,2}(?:st|nd|rd|th)?\b/;
    const yearPattern = /\b2\d{3}\b/;

    const monthMatch = text.match(monthPattern);
    const dayMatch = text.match(dayPattern);
    const yearMatch = text.match(yearPattern);

    if (monthMatch && dayMatch && yearMatch) {
      try {
        const date = new Date(
          `${monthMatch[0]} ${dayMatch[0]} ${yearMatch[0]}`
        );
        if (!isNaN(date.getTime())) {
          return date.toISOString().split("T")[0];
        }
      } catch (error) {
        console.error("Error parsing individual date components:", error);
      }
    }
  };

  const extractTime = (
    text: string
  ): { startTime?: string; endTime?: string } => {
    // Look for time patterns
    const timePatterns = [
      // Standard time format
      /\b(?:(?:0?[1-9]|1[0-2])(?::[0-5][0-9])?\s*(?:am|pm)|(?:2[0-3]|[01]?[0-9]):[0-5][0-9])\b/gi,
      // Time with keywords
      /(?:START|DOORS|BEGINNING|OPENS?)(?:\s+@|\s+AT|\s*:)?\s*(\d{1,2}(?::[0-5][0-9])?\s*(?:am|pm)?)/i,
      /(?:END|CLOSE|FINISH|ENDS?)(?:\s+@|\s+AT|\s*:)?\s*(\d{1,2}(?::[0-5][0-9])?\s*(?:am|pm)?)/i,
      // Time range format
      /(\d{1,2}(?::[0-5][0-9])?\s*(?:am|pm)?)\s*(?:-|to|until)\s*(\d{1,2}(?::[0-5][0-9])?\s*(?:am|pm)?)/i,
    ];

    let times: string[] = [];
    for (const pattern of timePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        times = times.concat(matches.slice(1).filter(Boolean));
      }
    }

    // Remove duplicates and sort
    times = Array.from(new Set(times)).sort();

    if (times.length >= 2) {
      return {
        startTime: formatTime(times[0]),
        endTime: formatTime(times[1]),
      };
    } else if (times.length === 1) {
      return {
        startTime: formatTime(times[0]),
      };
    }

    return {};
  };

  const formatTime = (timeStr: string): string => {
    // Convert various time formats to HH:mm
    const time = timeStr.toLowerCase();
    let hours = 0;
    let minutes = 0;

    if (time.includes(":")) {
      const [h, m] = time.split(":");
      hours = parseInt(h);
      minutes = parseInt(m);
    } else {
      hours = parseInt(time);
    }

    if (time.includes("pm") && hours < 12) {
      hours += 12;
    }
    if (time.includes("am") && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const extractLocation = (text: string): string | undefined => {
    const patterns = [
      // Location indicators
      /(?:at|venue|location|place):\s+([A-Z][^\n]+)/i,
      /(?:^|\n)(?:at\s+)([A-Z][^,\n]+)(?:,|\n|$)/im,
      // Address patterns
      /\b(\d+[A-Za-z\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)[^,\n]*)/i,
      // Venue name patterns
      /(?:^|\n)([A-Z][A-Za-z\s&]+(?:Club|Lounge|Bar|Venue|Hall|Arena|Stadium|Center|Centre|Theatre|Theater|Auditorium|Pavilion)[^,\n]*)/m,
      // Location with city/state
      /([^,\n]+,[^,\n]+(?:AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY))/i,
      // Location in parentheses
      /\(([^)]+(?:Club|Lounge|Bar|Venue|Hall|Arena|Stadium|Center|Theatre|Theater)[^)]*)\)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        const location = match[1].trim();
        // Clean up common prefixes
        return location.replace(/^(?:at|in|the)\s+/i, "");
      }
    }
  };

  const extractTicketLink = (text: string): string | undefined => {
    const patterns = [
      // Ticket URLs
      /(?:tickets?|book|buy|purchase)(?:\s+at)?:\s*(https?:\/\/\S+)/i,
      /(https?:\/\/(?:www\.)?(?:eventbrite|ticketmaster|dice|stubhub|livenation|axs|seetickets|ticketweb)\.\S+)/i,
      // General URLs
      /\b(https?:\/\/[^\s<>"\]]+)/i,
      // Common ticket domains
      /(?:www\.)?(?:eventbrite|ticketmaster|dice|stubhub|livenation|axs|seetickets|ticketweb)\.[a-z]+\/\S+/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        let url = match[1];
        // Ensure URL has protocol
        if (!url.startsWith("http")) {
          url = "https://" + url;
        }
        return url;
      }
    }
  };

  const handleApprove = () => {
    if (editedEvent) {
      onEventDetected(editedEvent);

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
                  <CircularProgress variant="determinate" value={progress} />
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
                <IconButton size="small" onClick={handleDelete} sx={{ ml: 2 }}>
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
              <Button onClick={() => setIsImageExpanded(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Title"
                value={editedEvent?.title || ""}
                onChange={(e) =>
                  setEditedEvent((prev) =>
                    prev ? { ...prev, title: e.target.value } : null
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
                label="Location"
                value={editedEvent?.location || ""}
                onChange={(e) =>
                  setEditedEvent((prev) =>
                    prev ? { ...prev, location: e.target.value } : null
                  )
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="time"
                label="Start Time"
                value={editedEvent?.startTime || ""}
                onChange={(e) =>
                  setEditedEvent((prev) =>
                    prev ? { ...prev, startTime: e.target.value } : null
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
                label="Ticket Link"
                value={editedEvent?.ticketLink || ""}
                onChange={(e) =>
                  setEditedEvent((prev) =>
                    prev ? { ...prev, ticketLink: e.target.value } : null
                  )
                }
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
  );
};

export default FlyerScanner;
