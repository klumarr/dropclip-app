import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { uploadService } from "../../../services/upload.service";
import { UploadConfig } from "../../../types/events";

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

interface UploadFormProps {
  eventId: string;
  linkId: string;
  uploadConfig: UploadConfig;
  onSuccess: () => void;
}

export const UploadForm: React.FC<UploadFormProps> = ({
  eventId,
  linkId,
  uploadConfig,
  onSuccess,
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        progress: 0,
        status: "pending" as const,
      }));

      setFiles((prev) =>
        [...prev, ...newFiles].slice(0, uploadConfig.maxFiles || 5)
      );
    },
    [uploadConfig.maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: (
      uploadConfig.allowedTypes || ["video/mp4", "video/quicktime"]
    ).reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: uploadConfig.maxFileSize || 100 * 1024 * 1024,
    maxFiles: uploadConfig.maxFiles || 5,
  });

  const handleUpload = async (fileItem: UploadFile) => {
    try {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id ? { ...f, status: "uploading" } : f
        )
      );

      await uploadService.createUpload(
        {
          eventId,
          filename: fileItem.file.name,
          fileSize: fileItem.file.size,
          fileType: fileItem.file.type,
          file: fileItem.file,
        },
        (progress) => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id
                ? { ...f, progress: (progress.loaded / progress.total) * 100 }
                : f
            )
          );
        }
      );

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id ? { ...f, status: "completed" } : f
        )
      );

      onSuccess?.();
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                status: "error",
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : f
        )
      );
    }
  };

  const handleRemove = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <Box>
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          mb: 2,
          border: "2px dashed",
          borderColor: isDragActive ? "primary.main" : "divider",
          bgcolor: "background.default",
          cursor: "pointer",
          textAlign: "center",
        }}
      >
        <input {...getInputProps()} />
        <UploadIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive
            ? "Drop the files here"
            : "Drag and drop files here, or click to select"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Supported formats:{" "}
          {uploadConfig.allowedTypes?.join(", ") ||
            "video/mp4, video/quicktime"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Maximum file size:{" "}
          {(uploadConfig.maxFileSize || 100 * 1024 * 1024) / (1024 * 1024)}MB
        </Typography>
      </Paper>

      <List>
        {files.map((file) => (
          <ListItem key={file.id}>
            <ListItemText
              primary={file.file.name}
              secondary={
                file.status === "error" ? (
                  <Typography color="error">{file.error}</Typography>
                ) : (
                  <LinearProgress
                    variant="determinate"
                    value={file.progress}
                    sx={{ mt: 1 }}
                  />
                )
              }
            />
            <ListItemSecondaryAction>
              {file.status === "pending" && (
                <Button
                  size="small"
                  onClick={() => handleUpload(file)}
                  startIcon={<UploadIcon />}
                >
                  Upload
                </Button>
              )}
              {file.status === "completed" && <CheckIcon color="success" />}
              {file.status === "error" && <ErrorIcon color="error" />}
              <IconButton
                edge="end"
                onClick={() => handleRemove(file.id)}
                disabled={file.status === "uploading"}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
