import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Tooltip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Visibility as PreviewIcon,
  PlaylistAdd as AddToCollectionIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { Upload } from "../../types/uploads";
import { formatFileSize, formatDate } from "../../utils/format";

interface ApprovedContentProps {
  uploads: Upload[];
  onDownload: (uploadId: string) => void;
  onAddToCollection?: (uploadId: string) => void;
  onRemoveFromCollection?: (uploadId: string) => void;
}

interface PreviewDialogProps {
  open: boolean;
  upload: Upload | null;
  onClose: () => void;
  onDownload: () => void;
  onAddToCollection?: () => void;
  onRemoveFromCollection?: () => void;
}

const PreviewDialog: React.FC<PreviewDialogProps> = ({
  open,
  upload,
  onClose,
  onDownload,
  onAddToCollection,
  onRemoveFromCollection,
}) => {
  if (!upload) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Content Preview</DialogTitle>
      <DialogContent>
        <Box sx={{ position: "relative", width: "100%", pt: "56.25%" }}>
          {upload.fileType === "video" ? (
            <video
              src={upload.fileUrl}
              controls
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <img
              src={upload.fileUrl}
              alt="Upload preview"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          )}
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">
            Uploaded by: {upload.uploaderName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            File size: {formatFileSize(upload.fileSize)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Uploaded: {formatDate(upload.uploadedAt)}
          </Typography>
          {upload.metadata?.duration && (
            <Typography variant="body2" color="text.secondary">
              Duration: {Math.round(upload.metadata.duration / 60)} minutes
            </Typography>
          )}
          {upload.metadata?.resolution && (
            <Typography variant="body2" color="text.secondary">
              Resolution: {upload.metadata.resolution}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {onRemoveFromCollection && (
          <Button onClick={onRemoveFromCollection} color="error">
            Remove from Collection
          </Button>
        )}
        {onAddToCollection && (
          <Button
            onClick={onAddToCollection}
            startIcon={<AddToCollectionIcon />}
          >
            Add to Collection
          </Button>
        )}
        <Button
          onClick={onDownload}
          color="primary"
          startIcon={<DownloadIcon />}
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const ApprovedContent: React.FC<ApprovedContentProps> = ({
  uploads,
  onDownload,
  onAddToCollection,
  onRemoveFromCollection,
}) => {
  const theme = useTheme();
  const [selectedUpload, setSelectedUpload] = useState<Upload | null>(null);

  if (uploads.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <Typography variant="body1" color="text.secondary">
          No approved content yet
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
              <CardMedia
                component={upload.fileType === "video" ? "video" : "img"}
                image={upload.thumbnailUrl || upload.fileUrl}
                title={`Upload by ${upload.uploaderName}`}
                sx={{
                  height: 200,
                  objectFit: "cover",
                  bgcolor: "background.default",
                }}
              />
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  {upload.uploaderName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(upload.uploadedAt)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatFileSize(upload.fileSize)}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 2,
                  }}
                >
                  <Tooltip title="Preview">
                    <IconButton
                      onClick={() => setSelectedUpload(upload)}
                      size="small"
                    >
                      <PreviewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download">
                    <IconButton
                      onClick={() => onDownload(upload.id)}
                      size="small"
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  {onAddToCollection && (
                    <Tooltip title="Add to Collection">
                      <IconButton
                        onClick={() => onAddToCollection(upload.id)}
                        size="small"
                      >
                        <AddToCollectionIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {onRemoveFromCollection && (
                    <Tooltip title="Remove from Collection">
                      <IconButton
                        onClick={() => onRemoveFromCollection(upload.id)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <PreviewDialog
        open={!!selectedUpload}
        upload={selectedUpload}
        onClose={() => setSelectedUpload(null)}
        onDownload={() => {
          if (selectedUpload) {
            onDownload(selectedUpload.id);
          }
        }}
        onAddToCollection={
          onAddToCollection && selectedUpload
            ? () => onAddToCollection(selectedUpload.id)
            : undefined
        }
        onRemoveFromCollection={
          onRemoveFromCollection && selectedUpload
            ? () => onRemoveFromCollection(selectedUpload.id)
            : undefined
        }
      />
    </>
  );
};
