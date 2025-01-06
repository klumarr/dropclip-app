import React, { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Card,
  CardMedia,
  CardContent,
  Grid,
  LinearProgress,
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Block as RejectIcon,
  Visibility as PreviewIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";

export interface Upload {
  id: string;
  eventId: string;
  uploaderId: string;
  uploaderName: string;
  fileUrl: string;
  thumbnailUrl?: string;
  status: "pending" | "approved" | "rejected";
  uploadedAt: string;
  fileType: "video" | "image";
  fileSize: number;
  metadata?: {
    duration?: number;
    resolution?: string;
  };
}

interface ModerationQueueProps {
  uploads: Upload[];
  onApprove: (uploadId: string) => void;
  onReject: (uploadId: string) => void;
  onDownload: (uploadId: string) => void;
}

export const ModerationQueue: React.FC<ModerationQueueProps> = ({
  uploads,
  onApprove,
  onReject,
  onDownload,
}) => {
  const [selectedUpload, setSelectedUpload] = useState<Upload | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handlePreview = (upload: Upload) => {
    setSelectedUpload(upload);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setSelectedUpload(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const renderPreviewContent = (upload: Upload) => {
    if (upload.fileType === "video") {
      return (
        <video
          src={upload.fileUrl}
          controls
          style={{ width: "100%", maxHeight: "70vh" }}
          poster={upload.thumbnailUrl}
        />
      );
    }
    return (
      <img
        src={upload.fileUrl}
        alt="Preview"
        style={{ width: "100%", maxHeight: "70vh", objectFit: "contain" }}
      />
    );
  };

  if (uploads.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="200px"
      >
        <Typography variant="h6" color="text.secondary">
          No pending uploads to review
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={2}>
        {uploads.map((upload) => (
          <Grid item xs={12} sm={6} md={4} key={upload.id}>
            <Card>
              {upload.thumbnailUrl && (
                <CardMedia
                  component="img"
                  height="140"
                  image={upload.thumbnailUrl}
                  alt="Upload thumbnail"
                  sx={{ cursor: "pointer" }}
                  onClick={() => handlePreview(upload)}
                />
              )}
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  {upload.uploaderName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Uploaded: {new Date(upload.uploadedAt).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Size: {formatFileSize(upload.fileSize)}
                </Typography>
                <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                  <IconButton
                    color="primary"
                    onClick={() => onApprove(upload.id)}
                    size="small"
                    title="Approve"
                  >
                    <ApproveIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => onReject(upload.id)}
                    size="small"
                    title="Reject"
                  >
                    <RejectIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handlePreview(upload)}
                    size="small"
                    title="Preview"
                  >
                    <PreviewIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => onDownload(upload.id)}
                    size="small"
                    title="Download"
                  >
                    <DownloadIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">
              Upload by {selectedUpload?.uploaderName}
            </Typography>
            <Chip
              label={selectedUpload?.status}
              color={
                selectedUpload?.status === "approved"
                  ? "success"
                  : selectedUpload?.status === "rejected"
                  ? "error"
                  : "warning"
              }
              size="small"
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedUpload && renderPreviewContent(selectedUpload)}
          {selectedUpload?.metadata && (
            <Box mt={2}>
              {selectedUpload.metadata.duration && (
                <Typography variant="body2" color="text.secondary">
                  Duration: {Math.floor(selectedUpload.metadata.duration / 60)}:
                  {String(selectedUpload.metadata.duration % 60).padStart(
                    2,
                    "0"
                  )}
                </Typography>
              )}
              {selectedUpload.metadata.resolution && (
                <Typography variant="body2" color="text.secondary">
                  Resolution: {selectedUpload.metadata.resolution}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onReject(selectedUpload!.id)} color="error">
            Reject
          </Button>
          <Button onClick={() => onApprove(selectedUpload!.id)} color="primary">
            Approve
          </Button>
          <Button onClick={handleClosePreview}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
