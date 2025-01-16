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
import { uploadOperations } from "../../services/operations/upload.operations";

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

interface UploadFormProps {
  eventId: string;
  userId: string;
  onUploadComplete?: () => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
}

export const UploadForm: React.FC<UploadFormProps> = ({
  eventId,
  userId,
  onUploadComplete,
  maxFiles = 5,
  maxFileSize = 100 * 1024 * 1024, // 100MB default
  allowedTypes = ["video/mp4", "video/quicktime"],
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

      setFiles((prev) => [...prev, ...newFiles].slice(0, maxFiles));
    },
    [maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize,
    maxFiles: maxFiles - files.length,
  });

  const handleUpload = async (fileItem: UploadFile) => {
    try {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id ? { ...f, status: "uploading" } : f
        )
      );

      const fileType = fileItem.file.type.startsWith("video/")
        ? "video"
        : "image";

      const fileKey = `${eventId}/${fileItem.id}/${fileItem.file.name}`;

      await uploadOperations.createUpload(
        {
          id: fileItem.id,
          eventId,
          userId,
          eventOwnerId: userId, // Since this is a fan upload form
          fileType,
          fileKey,
          key: fileKey,
          bucket: "dropclip-uploads-dev", // This should come from env config
          fileSize: fileItem.file.size,
          status: "pending",
          userEventId: `${userId}#${eventId}`,
          uploadDateEventId: `${new Date().toISOString()}#${eventId}`,
        },
        fileItem.file,
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

      onUploadComplete?.();
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
          Supported formats: {allowedTypes.join(", ")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Maximum file size: {maxFileSize / (1024 * 1024)}MB
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
