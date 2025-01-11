import React, { useCallback } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";

interface ImageUploadProps {
  imageUrl?: string;
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;
  error?: string;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  imageUrl,
  onImageUpload,
  onImageRemove,
  error,
  disabled = false,
}) => {
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        onImageUpload(file);
      }
    },
    [onImageUpload]
  );

  return (
    <Box>
      {imageUrl ? (
        <Box
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: 400,
            aspectRatio: "16/9",
            borderRadius: 1,
            overflow: "hidden",
            mb: 2,
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
            onClick={onImageRemove}
            disabled={disabled}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "background.paper",
              "&:hover": {
                bgcolor: "background.paper",
              },
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ) : (
        <Box
          sx={{
            width: "100%",
            maxWidth: 400,
            aspectRatio: "16/9",
            border: "2px dashed",
            borderColor: error ? "error.main" : "divider",
            borderRadius: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
            cursor: disabled ? "not-allowed" : "pointer",
            "&:hover": {
              borderColor: error ? "error.main" : "primary.main",
            },
          }}
        >
          <input
            accept="image/*"
            type="file"
            onChange={handleFileSelect}
            style={{ display: "none" }}
            id="image-upload-input"
            disabled={disabled}
          />
          <label htmlFor="image-upload-input">
            <Button
              component="span"
              variant="outlined"
              disabled={disabled}
              sx={{ mb: 1 }}
            >
              Upload Image
            </Button>
          </label>
          <Typography variant="caption" color="text.secondary">
            Drag and drop an image or click to select
          </Typography>
        </Box>
      )}
      {error && (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      )}
    </Box>
  );
};
