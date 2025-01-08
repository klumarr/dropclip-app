import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { ImageUploadProps } from "./types";

const ImageUpload: React.FC<ImageUploadProps> = ({
  imageUrl,
  imageFile,
  onImageUpload,
  onImageRemove,
  error,
  uploadProgress,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    } else {
      setPreviewUrl("");
    }
  }, [imageFile]);

  useEffect(() => {
    console.log("Upload progress updated:", uploadProgress);
  }, [uploadProgress]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File selected:", file.name);
      onImageUpload(file);
    }
  };

  const showPreview = imageUrl || previewUrl;
  const isUploading = uploadProgress > 0 && uploadProgress < 100;

  console.log("ImageUpload render:", {
    showPreview,
    isUploading,
    uploadProgress,
    hasImageUrl: !!imageUrl,
    hasPreviewUrl: !!previewUrl,
  });

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Event Flyer
      </Typography>
      {showPreview ? (
        <Paper
          sx={{
            position: "relative",
            width: "100%",
            height: 200,
            overflow: "hidden",
            borderRadius: 1,
          }}
        >
          <img
            src={imageUrl || previewUrl}
            alt="Event flyer"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          {isUploading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(0, 0, 0, 0.5)",
              }}
            >
              <Box sx={{ position: "relative", display: "inline-flex" }}>
                <CircularProgress
                  variant="determinate"
                  value={uploadProgress}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="caption" component="div" color="white">
                    {`${Math.round(uploadProgress)}%`}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
          <IconButton
            size="small"
            onClick={onImageRemove}
            disabled={isUploading}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "rgba(0, 0, 0, 0.5)",
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.7)",
              },
            }}
          >
            <DeleteIcon sx={{ color: "white" }} />
          </IconButton>
        </Paper>
      ) : (
        <Button
          component="label"
          variant="outlined"
          startIcon={<UploadIcon />}
          disabled={isUploading}
          sx={{
            width: "100%",
            height: 200,
            border: "2px dashed",
            borderColor: error ? "error.main" : "divider",
          }}
        >
          Upload Flyer
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleFileSelect}
          />
        </Button>
      )}
      {error && (
        <Typography color="error" variant="caption" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default ImageUpload;
