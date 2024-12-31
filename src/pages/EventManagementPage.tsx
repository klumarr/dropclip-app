import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Button,
  Tabs,
  Tab,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from "@mui/material";
import {
  Download,
  Delete,
  CloudDownload,
  Check,
  Close,
  ArrowBack,
  Add,
  ContentCopy,
  Block,
} from "@mui/icons-material";
import { useVideoPlayer } from "../contexts/VideoPlayerContext";
import { uploadLinkOperations } from "../services/uploadLink.service";
import { UploadLink } from "../services/uploadLink.service";

interface Upload {
  id: string;
  userId: string;
  userName: string;
  fileType: "image" | "video";
  fileUrl: string;
  thumbnailUrl?: string;
  uploadDate: string;
  status: "pending" | "approved" | "rejected";
  size: number;
}

interface EventDetails {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  imageUrl?: string;
  uploadConfig?: {
    enabled: boolean;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    maxFileSize?: number;
    allowedTypes?: string[];
  };
}

const EventManagementPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const { playVideo } = useVideoPlayer();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedUpload, setSelectedUpload] = useState<Upload | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [uploads, setUploads] = useState<{
    pending: Upload[];
    approved: Upload[];
    rejected: Upload[];
  }>({
    pending: [],
    approved: [],
    rejected: [],
  });
  const [uploadLinks, setUploadLinks] = useState<UploadLink[]>([]);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  useEffect(() => {
    setEventDetails({
      id: eventId || "",
      title: "Summer Festival 2024",
      date: "2024-07-15",
      location: "Central Park, NY",
      description: "Annual summer music festival featuring local artists",
      imageUrl: "https://example.com/event1.jpg",
      uploadConfig: {
        enabled: true,
        startDate: "2024-07-15",
        endDate: "2024-07-22",
        startTime: "10:00",
        endTime: "22:00",
        maxFileSize: 100,
        allowedTypes: ["image/*", "video/*"],
      },
    });

    setUploads({
      pending: [
        {
          id: "1",
          userId: "user1",
          userName: "John Doe",
          fileType: "video",
          fileUrl: "https://example.com/video1.mp4",
          thumbnailUrl: "https://example.com/thumb1.jpg",
          uploadDate: new Date().toISOString(),
          status: "pending",
          size: 25000000, // 25MB
        },
      ],
      approved: [],
      rejected: [],
    });
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      loadUploadLinks();
    }
  }, [eventId]);

  const loadUploadLinks = async () => {
    if (!eventId) return;
    try {
      const links = await uploadLinkOperations.listEventLinks(eventId);
      setUploadLinks(links);
    } catch (error) {
      console.error("Failed to load upload links:", error);
    }
  };

  const handleGenerateLink = async () => {
    if (!eventId) return;
    setIsGeneratingLink(true);
    try {
      const link = await uploadLinkOperations.generateLink(
        eventId,
        "creative-id",
        {
          expirationHours: 24,
          maxUploads: 10,
        }
      );
      setUploadLinks((prev) => [...prev, link]);
    } catch (error) {
      console.error("Failed to generate upload link:", error);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyLink = (linkId: string) => {
    const url = `${window.location.origin}/upload/${linkId}`;
    navigator.clipboard.writeText(url);
    // TODO: Show success toast
  };

  const handleDeactivateLink = async (linkId: string) => {
    try {
      await uploadLinkOperations.deactivateLink(linkId);
      setUploadLinks((prev) =>
        prev.map((link) =>
          link.id === linkId ? { ...link, isActive: false } : link
        )
      );
    } catch (error) {
      console.error("Failed to deactivate link:", error);
    }
  };

  const handleStatusChange = (
    upload: Upload,
    newStatus: "approved" | "rejected"
  ) => {
    setUploads((prev) => {
      // Remove from current status
      const currentStatus = upload.status;
      const updatedCurrentList = prev[currentStatus].filter(
        (u) => u.id !== upload.id
      );

      // Add to new status
      const updatedUpload = { ...upload, status: newStatus };

      return {
        ...prev,
        [currentStatus]: updatedCurrentList,
        [newStatus]: [...prev[newStatus], updatedUpload],
      };
    });
  };

  const handleDownload = (upload: Upload) => {
    // Implement download functionality
    window.open(upload.fileUrl, "_blank");
  };

  const handleDelete = (upload: Upload) => {
    setUploads((prev) => ({
      ...prev,
      [upload.status]: prev[upload.status].filter((u) => u.id !== upload.id),
    }));
  };

  const handleVideoClick = (upload: Upload) => {
    if (upload.fileType === "video") {
      playVideo({
        url: upload.fileUrl,
        title: `${upload.userName}'s Upload`,
        thumbnailUrl: upload.thumbnailUrl,
      });
    } else {
      setSelectedUpload(upload);
      setIsPreviewOpen(true);
    }
  };

  const renderUploadCard = (upload: Upload) => (
    <Card
      key={upload.id}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
      }}
    >
      <CardMedia
        component={upload.fileType === "video" ? "video" : "img"}
        src={upload.thumbnailUrl || upload.fileUrl}
        sx={{
          height: 200,
          objectFit: "cover",
          cursor: "pointer",
        }}
        onClick={() => handleVideoClick(upload)}
      />
      <CardContent>
        <Typography variant="subtitle1">{upload.userName}</Typography>
        <Typography variant="body2" color="text.secondary">
          {new Date(upload.uploadDate).toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {(upload.size / 1000000).toFixed(1)}MB
        </Typography>
        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
          {upload.status === "pending" && (
            <>
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleStatusChange(upload, "approved")}
              >
                <Check />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleStatusChange(upload, "rejected")}
              >
                <Close />
              </IconButton>
            </>
          )}
          <IconButton size="small" onClick={() => handleDownload(upload)}>
            <Download />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(upload)}>
            <Delete />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  const renderUploadLinks = () => (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Upload Links</Typography>
        <Button
          variant="contained"
          onClick={handleGenerateLink}
          disabled={isGeneratingLink}
          startIcon={<Add />}
        >
          Generate Link
        </Button>
      </Box>

      {uploadLinks.length === 0 ? (
        <Typography color="text.secondary">
          No upload links generated yet.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {uploadLinks.map((link) => (
            <Grid item xs={12} key={link.id}>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Link ID: {link.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Expires: {new Date(link.expiresAt).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Uploads: {link.currentUploads} / {link.maxUploads}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      onClick={() => handleCopyLink(link.id)}
                      disabled={!link.isActive}
                    >
                      <ContentCopy />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeactivateLink(link.id)}
                      disabled={!link.isActive}
                      color="error"
                    >
                      <Block />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  if (!eventDetails) return null;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ position: "relative", mb: 6 }}>
        {/* Back Navigation */}
        <IconButton
          onClick={() => navigate("/events")}
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.7)",
            },
            zIndex: 1,
          }}
        >
          <ArrowBack />
        </IconButton>

        {/* Event Flyer */}
        <Box
          sx={{
            position: "relative",
            height: 300,
            borderRadius: 2,
            overflow: "hidden",
            mb: 3,
          }}
        >
          <Box
            component="img"
            src={eventDetails.imageUrl || "/placeholder-event.jpg"}
            alt={eventDetails.title}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
              p: 3,
            }}
          >
            <Typography variant="h5" gutterBottom>
              {eventDetails.title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {new Date(eventDetails.date).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {eventDetails.location}
            </Typography>
          </Box>
        </Box>

        {/* Stats Chips */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip
            label={`${uploads.pending.length} Pending`}
            color="warning"
            variant="outlined"
            size="small"
          />
          <Chip
            label={`${uploads.approved.length} Approved`}
            color="success"
            variant="outlined"
            size="small"
          />
          <Chip
            label={`${uploads.rejected.length} Rejected`}
            color="error"
            variant="outlined"
            size="small"
          />
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Pending" />
          <Tab label="Approved" />
          <Tab label="Rejected" />
        </Tabs>

        <Grid container spacing={3}>
          {activeTab === 0 &&
            uploads.pending.map((upload) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={upload.id}>
                {renderUploadCard(upload)}
              </Grid>
            ))}
          {activeTab === 1 &&
            uploads.approved.map((upload) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={upload.id}>
                {renderUploadCard(upload)}
              </Grid>
            ))}
          {activeTab === 2 &&
            uploads.rejected.map((upload) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={upload.id}>
                {renderUploadCard(upload)}
              </Grid>
            ))}
        </Grid>
      </Box>

      <Dialog
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Image Preview</DialogTitle>
        <DialogContent>
          <img
            src={selectedUpload?.fileUrl}
            alt="Preview"
            style={{ width: "100%", height: "auto" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPreviewOpen(false)}>Close</Button>
          {selectedUpload && (
            <Button
              startIcon={<CloudDownload />}
              onClick={() => handleDownload(selectedUpload)}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {renderUploadLinks()}
    </Container>
  );
};

export default EventManagementPage;
