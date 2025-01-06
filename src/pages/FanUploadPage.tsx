import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Container,
  Button,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { uploadLinkOperations } from "../services/uploadLink.service";
import { uploadOperations } from "../services/dynamodb.service";
import { s3Operations } from "../services/s3.service";
import { UploadItem, UploadStatus } from "../types/uploads";
import { nanoid } from "nanoid";
import { eventOperations } from "../services/eventsService";

interface UploadState {
  status: "idle" | "ready" | "uploading" | "success" | "error";
  message?: string;
  progress?: number;
}

interface EventDetails {
  title: string;
  date: string;
}

const FanUploadPage = () => {
  const { linkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
  });
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);

  const createUploadObject = async (eventId: string, file: File) => {
    const now = new Date().toISOString();
    const userId = "anonymous";
    const uploadId = nanoid();
    const fileKey = s3Operations.generateFileKey(eventId, userId, file.name);

    try {
      // Get event details
      const events = await eventOperations.getCreativeEvents();
      const eventDetails = events.find((e) => e.id === eventId);
      if (!eventDetails) {
        throw new Error("Event not found");
      }

      return {
        id: uploadId,
        eventId,
        userId,
        eventOwnerId: eventDetails.user_id,
        uploaderId: userId,
        uploaderName: "Anonymous Fan",
        fileType: "video" as const,
        status: "pending" as const,
        processingStatus: "pending" as const,
        userEventId: userId,
        uploadDateEventId: `${now}#${eventId}`,
        fileKey,
        uploadedAt: now,
        fileSize: file.size,
      } satisfies Omit<UploadItem, "uploadDate" | "fileUrl" | "thumbnailUrl">;
    } catch (error) {
      console.error("Failed to get event details:", error);
      throw new Error("Failed to create upload object");
    }
  };

  const validateUploadLink = async () => {
    if (!linkId) {
      setUploadState({
        status: "error",
        message: "Invalid upload link",
      });
      return;
    }

    try {
      const link = await uploadLinkOperations.getLink(linkId);
      if (!link || !link.isActive || link.currentUploads >= link.maxUploads) {
        setUploadState({
          status: "error",
          message: link
            ? "Upload limit reached or link expired"
            : "Invalid upload link",
        });
        return;
      }

      // Get event details
      const events = await eventOperations.getCreativeEvents();
      const eventDetails = events.find((e) => e.id === link.eventId);
      if (eventDetails) {
        setEventDetails({
          title: eventDetails.title,
          date: new Date(eventDetails.date).toLocaleDateString(),
        });
        setUploadState({ status: "ready" });
      }
    } catch (error) {
      console.error("Failed to validate upload link:", error);
      setUploadState({
        status: "error",
        message: "Failed to validate upload link",
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = ["video/mp4", "video/quicktime", "video/x-m4v"];
      if (!validTypes.includes(file.type)) {
        setUploadState({
          status: "error",
          message: "Please select a valid video file (MP4, MOV, or M4V)",
        });
        return;
      }

      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        setUploadState({
          status: "error",
          message: "File size must be less than 500MB",
        });
        return;
      }

      setSelectedFile(file);
      setUploadState({ status: "ready" });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !linkId) return;

    setUploadState({ status: "uploading", progress: 0 });

    try {
      const link = await uploadLinkOperations.getLink(linkId);
      if (!link) throw new Error("Upload link not found");

      // Create upload object first
      const uploadObject = await createUploadObject(link.eventId, selectedFile);

      // Create upload record with proper composite keys
      const upload = await uploadOperations.createUpload(
        uploadObject,
        selectedFile
      );

      // Increment upload count
      await uploadLinkOperations.incrementUploadCount(linkId);

      setUploadState({
        status: "success",
        message: "Video uploaded successfully!",
      });

      // Redirect to success page after 3 seconds
      setTimeout(() => {
        navigate(`/upload-success/${upload.id}`);
      }, 3000);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadState({
        status: "error",
        message: "Failed to upload video. Please try again.",
      });
    }
  };

  useEffect(() => {
    validateUploadLink();
  }, [linkId]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          {uploadState.status === "error" ? (
            <Alert severity="error">{uploadState.message}</Alert>
          ) : uploadState.status === "success" ? (
            <Alert severity="success">{uploadState.message}</Alert>
          ) : uploadState.status === "idle" ? (
            <CircularProgress />
          ) : (
            <>
              {eventDetails && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    {eventDetails.title}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {eventDetails.date}
                  </Typography>
                </Box>
              )}
              <input
                accept="video/*"
                style={{ display: "none" }}
                id="upload-file"
                type="file"
                onChange={handleFileSelect}
                disabled={uploadState.status === "uploading"}
              />
              <label htmlFor="upload-file">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUpload />}
                  disabled={uploadState.status === "uploading"}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Select Video
                </Button>
              </label>
              {selectedFile && (
                <>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Selected file: {selectedFile.name}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpload}
                    disabled={uploadState.status === "uploading"}
                    fullWidth
                  >
                    {uploadState.status === "uploading"
                      ? "Uploading..."
                      : "Upload Video"}
                  </Button>
                </>
              )}
              {uploadState.status === "uploading" && (
                <Box sx={{ width: "100%", mt: 2 }}>
                  <CircularProgress
                    variant="determinate"
                    value={uploadState.progress || 0}
                  />
                </Box>
              )}
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default FanUploadPage;
