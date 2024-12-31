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
import { UploadItem } from "../config/dynamodb";
import { nanoid } from "nanoid";

type UploadStatus =
  | "idle"
  | "validating"
  | "ready"
  | "uploading"
  | "success"
  | "error";

interface UploadState {
  status: UploadStatus;
  message?: string;
  progress?: number;
}

const createUploadObject = (eventId: string) => {
  const now = new Date().toISOString();
  const userId = "anonymous";
  return {
    id: nanoid(),
    eventId,
    userId,
    fileType: "video" as const,
    status: "pending" as const,
    userEventId: userId,
    uploadDateEventId: `${now}#${eventId}`,
  } satisfies Omit<UploadItem, "uploadDate" | "fileUrl" | "thumbnailUrl">;
};

const isUploadingStatus = (status: UploadStatus): boolean => {
  return status === "uploading";
};

const FanUploadPage = () => {
  const { linkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "validating",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [eventDetails, setEventDetails] = useState<{
    title: string;
    date: string;
  } | null>(null);

  useEffect(() => {
    validateUploadLink();
  }, [linkId]);

  const validateUploadLink = async () => {
    if (!linkId) {
      setUploadState({
        status: "error",
        message: "Invalid upload link",
      });
      return;
    }

    try {
      const validation = await uploadLinkOperations.validateLink(linkId);
      if (!validation.isValid) {
        setUploadState({
          status: "error",
          message: validation.error || "Invalid upload link",
        });
        return;
      }

      // Get event details
      const link = await uploadLinkOperations.getLink(linkId);
      if (link) {
        // TODO: Fetch actual event details
        setEventDetails({
          title: "Event Title",
          date: new Date().toLocaleDateString(),
        });
        setUploadState({ status: "ready" });
      }
    } catch (error) {
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

      // Create upload record with proper composite keys
      const upload = await uploadOperations.createUpload(
        createUploadObject(link.eventId),
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

  const renderContent = () => {
    switch (uploadState.status) {
      case "validating":
        return (
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={20} />
            <Typography>Validating upload link...</Typography>
          </Box>
        );

      case "error":
        return (
          <Alert severity="error" sx={{ width: "100%" }}>
            {uploadState.message}
          </Alert>
        );

      case "ready":
      case "idle":
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            {eventDetails && (
              <Box textAlign="center" mb={2}>
                <Typography variant="h5">{eventDetails.title}</Typography>
                <Typography color="text.secondary">
                  {eventDetails.date}
                </Typography>
              </Box>
            )}

            <Paper
              sx={{
                p: 4,
                textAlign: "center",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                },
              }}
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              <input
                type="file"
                id="fileInput"
                accept="video/*"
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />
              <CloudUpload sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {selectedFile
                  ? selectedFile.name
                  : "Click to select a video to upload"}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Maximum file size: 500MB
                <br />
                Supported formats: MP4, MOV, M4V
              </Typography>
            </Paper>

            {selectedFile && (
              <Button
                variant="contained"
                size="large"
                onClick={handleUpload}
                disabled={isUploadingStatus(uploadState.status)}
              >
                Upload Video
              </Button>
            )}
          </Box>
        );

      case "uploading":
        return (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
          >
            <CircularProgress
              variant="determinate"
              value={uploadState.progress || 0}
              size={60}
            />
            <Typography>Uploading video...</Typography>
          </Box>
        );

      case "success":
        return (
          <Alert severity="success" sx={{ width: "100%" }}>
            {uploadState.message}
          </Alert>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: "100vh",
          py: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Upload Your Video
        </Typography>
        {renderContent()}
      </Box>
    </Container>
  );
};

export default FanUploadPage;
