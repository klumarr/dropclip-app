import React from "react";
import { Box, Button, Typography, IconButton, Paper } from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { ImageUploadProps } from "./types";

const ImageUpload: React.FC<ImageUploadProps> = ({
  imageUrl,
  onImageUpload,
  onImageRemove,
  error,
}) => {
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Event Flyer
      </Typography>
      {imageUrl ? (
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
            src={imageUrl}
            alt="Event flyer"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <IconButton
            size="small"
            onClick={onImageRemove}
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
