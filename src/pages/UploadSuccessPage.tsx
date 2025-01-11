import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { uploadOperations } from "../services/dynamodb.service";
import { UploadItem } from "../config/dynamodb";

const UploadSuccessPage = () => {
  const { uploadId } = useParams<{ uploadId: string }>();
  const [upload, setUpload] = useState<UploadItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (uploadId) {
      loadUploadDetails();
    }
  }, [uploadId]);

  const loadUploadDetails = async () => {
    try {
      if (!uploadId) {
        throw new Error("Upload ID not found");
      }

      // Since we need eventId to get the upload details, we'll try to extract it from the uploadDateEventId
      const uploads = await uploadOperations.listEventUploads("*"); // This is a temporary solution
      const targetUpload = uploads.find((u) => u.id === uploadId);

      if (targetUpload) {
        setUpload(targetUpload);
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to load upload details:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          py: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            width: "100%",
          }}
        >
          <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Upload Successful!
          </Typography>
          <Typography color="text.secondary">
            Your video has been uploaded successfully and will be reviewed by
            the event organizer.
          </Typography>
          {upload && (
            <Box mt={4}>
              <Typography variant="subtitle1">Upload Details:</Typography>
              <Typography color="text.secondary">
                File: {upload.fileUrl.split("/").pop()}
              </Typography>
              <Typography color="text.secondary">
                Status: {upload.status}
              </Typography>
              <Typography color="text.secondary">
                Uploaded: {new Date(upload.uploadDate).toLocaleString()}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default UploadSuccessPage;
