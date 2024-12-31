import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Alert,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { CloudUpload, Close as CloseIcon } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

interface EventDetails {
  id: string;
  title: string;
  date: string;
  location: string;
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

const UploadBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  border: "2px dashed rgba(255, 255, 255, 0.1)",
  cursor: "pointer",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
}));

const FilePreview = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

const EventUploadPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // TODO: Fetch event details from API
    setEventDetails({
      id: eventId || "",
      title: "Summer Festival 2024",
      date: "2024-07-15",
      location: "Central Park, NY",
      uploadConfig: {
        enabled: true,
        startDate: "2024-07-15",
        endDate: "2024-07-22",
        startTime: "10:00",
        endTime: "22:00",
        maxFileSize: 100, // MB
        allowedTypes: ["video/*"],
      },
    });
  }, [eventId]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => {
      const isValidType = eventDetails?.uploadConfig?.allowedTypes?.some(
        (type) => file.type.match(type)
      );
      const isValidSize =
        file.size <=
        (eventDetails?.uploadConfig?.maxFileSize || 100) * 1024 * 1024;
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setError("Some files were rejected due to invalid type or size");
    }

    setSelectedFiles(validFiles);
    setError(null);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const validFiles = files.filter((file) => {
      const isValidType = eventDetails?.uploadConfig?.allowedTypes?.some(
        (type) => file.type.match(type)
      );
      const isValidSize =
        file.size <=
        (eventDetails?.uploadConfig?.maxFileSize || 100) * 1024 * 1024;
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setError("Some files were rejected due to invalid type or size");
    }

    setSelectedFiles(validFiles);
    setError(null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    try {
      setIsUploading(true);
      setError(null);
      setSuccess(false);

      // Simulated upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // After successful upload
      setSuccess(true);
      setIsUploading(false);
      setUploadProgress(0);
      setSelectedFiles([]);

      // Navigate after a short delay to show success message
      setTimeout(() => {
        navigate(`/events/${eventId}`);
      }, 1500);
    } catch (error) {
      setError("Failed to upload files. Please try again.");
      setIsUploading(false);
      setSuccess(false);
    }
  };

  if (!eventDetails) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const isUploadEnabled =
    eventDetails.uploadConfig?.enabled &&
    new Date() >=
      new Date(
        eventDetails.uploadConfig.startDate +
          "T" +
          (eventDetails.uploadConfig.startTime || "00:00")
      ) &&
    new Date() <=
      new Date(
        eventDetails.uploadConfig.endDate +
          "T" +
          (eventDetails.uploadConfig.endTime || "23:59")
      );

  if (!isUploadEnabled) {
    return (
      <Container maxWidth="md" sx={{ py: isMobile ? 2 : 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Upload window is not currently open for this event.
          <br />
          Upload window: {eventDetails.uploadConfig?.startDate}{" "}
          {eventDetails.uploadConfig?.startTime} to{" "}
          {eventDetails.uploadConfig?.endDate}{" "}
          {eventDetails.uploadConfig?.endTime}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: isMobile ? 2 : 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Files uploaded successfully!
        </Alert>
      )}

      <Box sx={{ mb: isMobile ? 2 : 4 }}>
        <Typography variant="h4" gutterBottom>
          Upload Media
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Share your moments from {eventDetails?.title}
        </Typography>
      </Box>

      <input
        type="file"
        id="file-input"
        multiple
        accept={eventDetails.uploadConfig?.allowedTypes?.join(",")}
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      <UploadBox
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById("file-input")?.click()}
        sx={{ p: isMobile ? 2 : 3 }}
      >
        <CloudUpload sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Drag & Drop or Click to Upload
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Maximum file size: {eventDetails.uploadConfig?.maxFileSize}MB
          <br />
          Accepted formats: Video files
        </Typography>
      </UploadBox>

      {selectedFiles.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Selected Files
          </Typography>
          {selectedFiles.map((file, index) => (
            <FilePreview key={index}>
              <Typography variant="body1" sx={{ flex: 1 }}>
                {file.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleRemoveFile(index)}
                sx={{ color: "text.secondary" }}
              >
                <CloseIcon />
              </IconButton>
            </FilePreview>
          ))}

          <Button
            variant="contained"
            fullWidth
            onClick={handleUpload}
            disabled={isUploading}
            sx={{
              mt: 2,
              height: 48,
              background: `linear-gradient(45deg, #9c27b0, #673ab7)`,
              "&:hover": {
                background: `linear-gradient(45deg, #7b1fa2, #512da8)`,
              },
            }}
          >
            {isUploading ? (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CircularProgress
                  size={24}
                  variant="determinate"
                  value={uploadProgress}
                  sx={{ mr: 1 }}
                />
                Uploading... {uploadProgress}%
              </Box>
            ) : (
              "Upload Files"
            )}
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default EventUploadPage;
