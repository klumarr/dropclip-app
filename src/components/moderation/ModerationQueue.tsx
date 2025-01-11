import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { Upload, UploadStatus } from "../../types/uploads";

interface ModerationQueueProps {
  uploads: Upload[];
  onApprove: (uploadId: string) => void;
  onReject: (uploadId: string) => void;
  onPreview: (upload: Upload) => void;
  onDownload: (uploadId: string) => Promise<void>;
}

export const ModerationQueue: React.FC<ModerationQueueProps> = ({
  uploads,
  onApprove,
  onReject,
  onPreview,
  onDownload,
}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Pending Moderation ({uploads.length})
      </Typography>
      <Grid container spacing={2}>
        {uploads.map((upload) => (
          <Grid item xs={12} sm={6} md={4} key={upload.id}>
            <Card>
              <Box
                sx={{
                  position: "relative",
                  paddingTop: "56.25%", // 16:9 aspect ratio
                  backgroundColor: "grey.200",
                }}
              >
                {upload.thumbnailUrl && (
                  <Box
                    component="img"
                    src={upload.thumbnailUrl}
                    alt={upload.filename}
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
                <IconButton
                  onClick={() => onPreview(upload)}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                    },
                  }}
                >
                  <PlayIcon sx={{ color: "white" }} />
                </IconButton>
              </Box>
              <CardContent>
                <Typography variant="subtitle1" noWrap>
                  {upload.filename}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {new Date(upload.uploadDate).toLocaleString()}
                </Typography>
                <Box
                  sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button
                    startIcon={<RejectIcon />}
                    color="error"
                    onClick={() => onReject(upload.id)}
                    sx={{ mr: 1 }}
                  >
                    Reject
                  </Button>
                  <Button
                    startIcon={<ApproveIcon />}
                    color="success"
                    onClick={() => onApprove(upload.id)}
                    sx={{ mr: 1 }}
                  >
                    Approve
                  </Button>
                  <Button
                    startIcon={<DownloadIcon />}
                    onClick={() => onDownload(upload.id)}
                  >
                    Download
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
