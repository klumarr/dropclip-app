import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Box,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { uploadOperations } from "../services/operations/upload.operations";
import { UploadItem } from "../config/dynamodb";
import { s3Operations } from "../services/s3.service";

interface DownloadState {
  [key: string]: {
    progress: number;
    status: "idle" | "downloading" | "paused" | "completed" | "error";
    error?: string;
  };
}

const DownloadCenterPage = () => {
  const { user } = useAuth();
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [downloadState, setDownloadState] = useState<DownloadState>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUploads();
    }
  }, [user]);

  const loadUploads = async () => {
    if (!user?.id) return;
    try {
      const userUploads = await uploadOperations.listUserUploads(user.id);
      setUploads(userUploads);
    } catch (error) {
      console.error("Failed to load uploads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (upload: UploadItem) => {
    try {
      setDownloadState((prev) => ({
        ...prev,
        [upload.id]: { progress: 0, status: "downloading" },
      }));

      const downloadUrl = await s3Operations.getDownloadUrl(upload.fileUrl);
      const response = await fetch(downloadUrl);
      const contentLength = Number(response.headers.get("content-length"));
      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error("Failed to initialize download");
      }

      let receivedLength = 0;
      const chunks: Uint8Array[] = [];

      /* eslint-disable no-constant-condition */
      // Using while(true) for ReadableStream processing is a standard pattern
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedLength += value.length;
      }
      /* eslint-enable no-constant-condition */

      const blob = new Blob(chunks);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = upload.fileUrl.split("/").pop() || "download";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloadState((prev) => ({
        ...prev,
        [upload.id]: { progress: 100, status: "completed" },
      }));
    } catch (error) {
      console.error("Download failed:", error);
      setDownloadState((prev) => ({
        ...prev,
        [upload.id]: {
          progress: 0,
          status: "error",
          error: error instanceof Error ? error.message : "Download failed",
        },
      }));
    }
  };

  const handlePauseResume = (uploadId: string) => {
    setDownloadState((prev) => ({
      ...prev,
      [uploadId]: {
        ...prev[uploadId],
        status:
          prev[uploadId].status === "downloading" ? "paused" : "downloading",
      },
    }));
  };

  const handleCancelDownload = (uploadId: string) => {
    setDownloadState((prev) => {
      const newState = { ...prev };
      delete newState[uploadId];
      return newState;
    });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Download Center
      </Typography>

      <Grid container spacing={3}>
        {uploads.map((upload) => (
          <Grid item xs={12} key={upload.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box flex={1}>
                    <Typography variant="h6">
                      {upload.fileUrl.split("/").pop() || "Untitled"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(upload.uploadDate).toLocaleString()}
                    </Typography>
                    {downloadState[upload.id] && (
                      <>
                        <LinearProgress
                          variant="determinate"
                          value={downloadState[upload.id].progress}
                          sx={{ my: 1 }}
                        />
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={downloadState[upload.id].status}
                            color={
                              downloadState[upload.id].status === "completed"
                                ? "success"
                                : "default"
                            }
                            size="small"
                          />
                          {downloadState[upload.id].error && (
                            <Typography
                              variant="caption"
                              color="error"
                              component="span"
                            >
                              {downloadState[upload.id].error}
                            </Typography>
                          )}
                        </Box>
                      </>
                    )}
                  </Box>
                  <Box>
                    {downloadState[upload.id]?.status === "downloading" ||
                    downloadState[upload.id]?.status === "paused" ? (
                      <>
                        <IconButton
                          onClick={() => handlePauseResume(upload.id)}
                          size="small"
                        >
                          {downloadState[upload.id].status === "downloading" ? (
                            <PauseIcon />
                          ) : (
                            <PlayIcon />
                          )}
                        </IconButton>
                        <IconButton
                          onClick={() => handleCancelDownload(upload.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    ) : (
                      <IconButton
                        onClick={() => handleDownload(upload)}
                        size="small"
                        disabled={
                          downloadState[upload.id]?.status === "completed"
                        }
                      >
                        <DownloadIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default DownloadCenterPage;
