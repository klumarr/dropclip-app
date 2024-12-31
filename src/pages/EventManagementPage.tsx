import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
} from "@mui/material";
import {
  PlayArrow,
  Download,
  Delete,
  Share,
  CloudDownload,
  Check,
  Close,
} from "@mui/icons-material";

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
  const { eventId } = useParams<{ eventId: string }>();
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

  // Mock data for testing
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
        onClick={() => {
          setSelectedUpload(upload);
          setIsPreviewOpen(true);
        }}
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

  if (!eventDetails) return null;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {eventDetails.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {new Date(eventDetails.date).toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {eventDetails.location}
        </Typography>
        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
          <Chip
            label={`${uploads.pending.length} Pending`}
            color="warning"
            variant="outlined"
          />
          <Chip
            label={`${uploads.approved.length} Approved`}
            color="success"
            variant="outlined"
          />
          <Chip
            label={`${uploads.rejected.length} Rejected`}
            color="error"
            variant="outlined"
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
        <DialogTitle>Content Preview</DialogTitle>
        <DialogContent>
          {selectedUpload?.fileType === "video" ? (
            <video
              src={selectedUpload.fileUrl}
              controls
              style={{ width: "100%" }}
            />
          ) : (
            <img
              src={selectedUpload?.fileUrl}
              alt="Preview"
              style={{ width: "100%", height: "auto" }}
            />
          )}
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
    </Container>
  );
};

export default EventManagementPage;
