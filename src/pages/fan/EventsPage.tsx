import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  ListItemIcon,
  FormLabel,
} from "@mui/material";
import {
  MoreVert,
  Share,
  Event,
  LocationOn,
  People,
  Star,
  StarBorder,
  CloudUpload,
  Close,
  Image,
  VideoFile,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { s3Operations } from "../../services/s3.service";
import { useAuth } from "../../contexts/AuthContext";
import { contentOperations } from "../../services/content.service";

// Styled components for upload functionality
const UploadContainer = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: "center",
  backgroundColor: theme.palette.background.paper,
  cursor: "pointer",
  transition: "border-color 0.3s ease",
  "&:hover": {
    borderColor: theme.palette.primary.main,
  },
}));

const FilePreviewContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1),
}));

interface FanEvent {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  attendees: number;
  isInterested: boolean;
  status: "upcoming" | "past";
  uploadConfig: {
    enabled: boolean;
    allowedTypes: string[];
    maxFileSize: number;
  };
}

const EventsPage: React.FC = () => {
  const { user } = useAuth();

  // State for events and tabs
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<FanEvent | null>(null);

  // State for upload functionality
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Mock data - replace with actual API call
  const events: FanEvent[] = [
    {
      id: "1",
      title: "Summer Music Festival",
      description: "Annual electronic music festival featuring top DJs",
      thumbnailUrl: "https://via.placeholder.com/320x180",
      date: "2024-07-15",
      time: "14:00",
      location: "Central Park, New York",
      organizer: "Event Productions Inc.",
      attendees: 1500,
      isInterested: false,
      status: "upcoming",
      uploadConfig: {
        enabled: true,
        allowedTypes: ["image/*", "video/*"],
        maxFileSize: 100 * 1024 * 1024, // 100MB
      },
    },
  ];

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    setSelectedFiles(Array.from(files));
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (!selectedEvent || !selectedFiles.length) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      for (const file of selectedFiles) {
        const key = `events/${selectedEvent.id}/${Date.now()}-${file.name}`;

        // Upload to S3
        await s3Operations.uploadFile(file, key, (progress) => {
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: progress,
          }));
        });

        // Create content record
        await contentOperations.createContent({
          eventId: selectedEvent.id,
          userId: user?.id || "",
          fileUrl: key,
          type: file.type,
        });
      }

      setSelectedFiles([]);
      setIsUploadDialogOpen(false);
      fetchEventContent(selectedEvent.id);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError("Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const fetchEventContent = async (eventId: string) => {
    try {
      const content = await contentOperations.getEventContent(eventId);
      console.log("Fetched content for event:", eventId, content);
    } catch (error) {
      console.error("Failed to fetch event content:", error);
    }
  };

  const handleInterestToggle = () => {
    if (selectedEvent) {
      console.log(
        `${
          selectedEvent.isInterested ? "Removing" : "Adding"
        } interest for event:`,
        selectedEvent.id
      );
      setAnchorEl(null);
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
          >
            <Tab label="Upcoming Events" />
            <Tab label="Past Events" />
          </Tabs>
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={2}>
            {events
              .filter((event) =>
                activeTab === 0
                  ? event.status === "upcoming"
                  : event.status === "past"
              )
              .map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="180"
                      image={event.thumbnailUrl}
                      alt={event.title}
                    />
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {event.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {event.description}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Grid container spacing={1}>
                          <Grid item xs={12}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Event fontSize="small" />
                              <Typography variant="body2">
                                {new Date(event.date).toLocaleDateString()} at{" "}
                                {event.time}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <LocationOn fontSize="small" />
                              <Typography variant="body2">
                                {event.location}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <People fontSize="small" />
                              <Typography variant="body2">
                                {event.attendees} attendees
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        p: 1,
                        borderTop: 1,
                        borderColor: "divider",
                      }}
                    >
                      <IconButton
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsUploadDialogOpen(true);
                        }}
                        disabled={!event.uploadConfig.enabled}
                      >
                        <CloudUpload />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          setSelectedEvent(event);
                          setAnchorEl(e.currentTarget);
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Grid>
      </Grid>

      {/* Upload Dialog */}
      <Dialog
        open={isUploadDialogOpen}
        onClose={() => !isUploading && setIsUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Upload Content
          {!isUploading && (
            <IconButton
              onClick={() => setIsUploadDialogOpen(false)}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent>
          {uploadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {uploadError}
            </Alert>
          )}
          <FormLabel
            htmlFor="file-input"
            sx={{
              mt: 2,
              width: "100%",
              display: "block",
              cursor: "pointer",
            }}
          >
            <UploadContainer>
              <input
                id="file-input"
                type="file"
                multiple
                accept={selectedEvent?.uploadConfig.allowedTypes.join(",")}
                onChange={(e) => handleFileSelect(e.target.files)}
                style={{ display: "none" }}
              />
              <CloudUpload sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Drop files here or click to upload
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supported formats:{" "}
                {selectedEvent?.uploadConfig.allowedTypes.join(", ")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Max file size:{" "}
                {(selectedEvent?.uploadConfig.maxFileSize || 0) / (1024 * 1024)}
                MB
              </Typography>
            </UploadContainer>
          </FormLabel>

          {selectedFiles.length > 0 && (
            <FilePreviewContainer>
              {selectedFiles.map((file) => (
                <Box
                  key={file.name}
                  sx={{
                    p: 1,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    {file.type.startsWith("image/") ? <Image /> : <VideoFile />}
                    <Typography variant="body2" noWrap>
                      {file.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setSelectedFiles((prev) =>
                          prev.filter((f) => f !== file)
                        )
                      }
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                  {uploadProgress[file.name] !== undefined && (
                    <LinearProgress
                      variant="determinate"
                      value={uploadProgress[file.name]}
                    />
                  )}
                </Box>
              ))}
            </FilePreviewContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsUploadDialogOpen(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
            variant="contained"
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Event Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            console.log("View content for event:", selectedEvent?.id);
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <Image fontSize="small" />
          </ListItemIcon>
          View Content
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          Share Event
        </MenuItem>
        <MenuItem onClick={handleInterestToggle}>
          <ListItemIcon>
            {selectedEvent?.isInterested ? (
              <Star fontSize="small" />
            ) : (
              <StarBorder fontSize="small" />
            )}
          </ListItemIcon>
          {selectedEvent?.isInterested
            ? "Remove Interest"
            : "Mark as Interested"}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export { EventsPage };
export default EventsPage;
