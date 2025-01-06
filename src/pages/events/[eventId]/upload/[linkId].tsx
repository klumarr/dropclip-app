import React, { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  LinearProgress,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { uploadLinkService } from "../../../../services/uploadLink.service";
import {
  uploadService,
  UploadError,
} from "../../../../services/upload.service";
import { useAuth } from "../../../../contexts/AuthContext";
import { nanoid } from "nanoid";
import { ErrorBoundary } from "../../../../components/ErrorBoundary";

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

export const UploadPage = () => {
  const { linkId, eventId } = useParams<{ linkId: string; eventId: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { user } = useAuth();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [remainingUploads, setRemainingUploads] = useState<number | null>(null);

  // Validate upload link and get remaining uploads
  useEffect(() => {
    const validateLink = async () => {
      if (!linkId) return;

      try {
        const { isValid, error } = await uploadLinkService.validateLink(linkId);
        if (!isValid) {
          setValidationError(error || "Invalid upload link");
          return;
        }

        const link = await uploadLinkService.getLink(linkId);
        if (link) {
          setRemainingUploads(link.maxUploads - link.currentUploads);
        }
      } catch (err) {
        setValidationError("Failed to validate upload link");
      } finally {
        setIsValidating(false);
      }
    };

    validateLink();
  }, [linkId]);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = event.target.files;
      if (!fileList || !remainingUploads) return;

      const newFiles: UploadFile[] = [];
      let errorMessage = "";

      Array.from(fileList).forEach((file) => {
        try {
          uploadService.validateFile(file);

          if (files.length + newFiles.length >= remainingUploads) {
            throw new UploadError(
              `You can only upload ${remainingUploads} more videos`,
              "UPLOAD_LIMIT_REACHED"
            );
          }

          newFiles.push({
            id: nanoid(),
            file,
            progress: 0,
            status: "pending",
          });
        } catch (error) {
          if (error instanceof UploadError) {
            errorMessage = error.message;
          } else {
            errorMessage = "Invalid file selected";
          }
        }
      });

      if (errorMessage) {
        setValidationError(errorMessage);
        return;
      }

      setFiles((prev) => [...prev, ...newFiles]);
      setValidationError(null);
    },
    [files.length, remainingUploads]
  );

  const handleUpload = async (fileItem: UploadFile) => {
    if (!user?.id || !eventId || !linkId) return;

    try {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id ? { ...f, status: "uploading" } : f
        )
      );

      await uploadService.createUpload(
        {
          id: fileItem.id,
          eventId,
          userId: user.id,
          file: fileItem.file,
        },
        (progress) => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id
                ? {
                    ...f,
                    progress: (progress.loaded / progress.total) * 100,
                  }
                : f
            )
          );
        }
      );

      await uploadLinkService.incrementUploadCount(linkId);

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? { ...f, status: "completed", progress: 100 }
            : f
        )
      );

      // Update remaining uploads
      const link = await uploadLinkService.getLink(linkId);
      if (link) {
        setRemainingUploads(link.maxUploads - link.currentUploads);
      }
    } catch (error) {
      const errorMessage =
        error instanceof UploadError ? error.message : "Failed to upload file";

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                status: "error",
                error: errorMessage,
              }
            : f
        )
      );
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const renderContent = () => {
    if (isValidating) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <CircularProgress />
        </Box>
      );
    }

    if (validationError) {
      return (
        <Box p={4}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {validationError}
          </Alert>
          <Button variant="contained" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Box>
      );
    }

    return (
      <Box p={isMobile ? 2 : 4}>
        <Typography variant="h4" gutterBottom>
          Upload Videos
        </Typography>

        {remainingUploads !== null && remainingUploads > 0 && (
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            You can upload {remainingUploads} more videos
          </Typography>
        )}

        <Paper
          sx={{
            p: isMobile ? 2 : 3,
            mt: 2,
            backgroundColor: "background.paper",
            borderRadius: 1,
          }}
        >
          <Box
            sx={{
              border: `2px dashed ${theme.palette.divider}`,
              borderRadius: 1,
              p: isMobile ? 2 : 3,
              textAlign: "center",
              mb: 3,
            }}
          >
            <input
              type="file"
              accept=".mp4,.mov,.m4v"
              multiple
              onChange={handleFileSelect}
              style={{ display: "none" }}
              id="file-input"
              disabled={remainingUploads === 0}
            />
            <label htmlFor="file-input">
              <Button
                variant="contained"
                component="span"
                startIcon={<UploadIcon />}
                disabled={remainingUploads === 0}
                fullWidth={isMobile}
              >
                Select Videos
              </Button>
            </label>
            <Typography
              variant={isMobile ? "caption" : "body2"}
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              MP4, MOV, or M4V files only. Maximum size: 500MB
            </Typography>
          </Box>

          {files.length > 0 && (
            <List>
              {files.map((file) => (
                <ListItem
                  key={file.id}
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    mb: 1,
                    flexDirection: isMobile ? "column" : "row",
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant={isMobile ? "body2" : "body1"}
                        noWrap
                        sx={{ maxWidth: isMobile ? "200px" : "none" }}
                      >
                        {file.file.name}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ width: "100%" }}>
                        <LinearProgress
                          variant={
                            file.status === "uploading"
                              ? "indeterminate"
                              : "determinate"
                          }
                          value={file.progress}
                          sx={{ mt: 1 }}
                        />
                        {file.error && (
                          <Typography color="error" variant="caption">
                            {file.error}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction
                    sx={
                      isMobile
                        ? {
                            position: "relative",
                            transform: "none",
                            marginTop: 1,
                          }
                        : undefined
                    }
                  >
                    {file.status === "pending" && (
                      <>
                        <Button
                          onClick={() => handleUpload(file)}
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          Upload
                        </Button>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveFile(file.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                    {file.status === "uploading" && (
                      <CircularProgress size={24} />
                    )}
                    {file.status === "completed" && (
                      <CheckCircleIcon color="success" />
                    )}
                    {file.status === "error" && <ErrorIcon color="error" />}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    );
  };

  return <ErrorBoundary>{renderContent()}</ErrorBoundary>;
};

export default UploadPage;
