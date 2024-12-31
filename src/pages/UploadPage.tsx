import React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  LinearProgress,
  IconButton,
} from "@mui/material";
import { CloudUpload, Close } from "@mui/icons-material";

export const UploadPage = () => {
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(
    null
  );
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev === null || prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setUploadProgress(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Upload Video
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minHeight: 400,
              backgroundColor: "background.paper",
              borderRadius: 2,
            }}
          >
            {!selectedFile ? (
              <>
                <CloudUpload
                  sx={{ fontSize: 64, color: "primary.main", mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  Drag and drop your video here
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  or
                </Typography>
                <Button variant="contained" component="label" sx={{ mt: 2 }}>
                  Select File
                  <input
                    type="file"
                    hidden
                    accept="video/*"
                    onChange={handleFileSelect}
                  />
                </Button>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Maximum file size: 2GB
                </Typography>
              </>
            ) : (
              <Box sx={{ width: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle1">
                    {selectedFile.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={handleCancelUpload}
                    sx={{ color: "text.secondary" }}
                  >
                    <Close />
                  </IconButton>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress ?? 0}
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {uploadProgress}% uploaded
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: "background.paper",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Upload Guidelines
            </Typography>
            <Typography variant="body2" paragraph>
              • Maximum file size: 2GB
            </Typography>
            <Typography variant="body2" paragraph>
              • Supported formats: MP4, MOV, AVI
            </Typography>
            <Typography variant="body2" paragraph>
              • Recommended resolution: 1080p or higher
            </Typography>
            <Typography variant="body2" paragraph>
              • Maximum duration: 30 minutes
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
