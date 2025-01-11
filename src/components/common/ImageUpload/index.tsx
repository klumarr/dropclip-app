import React, { useCallback, useState } from "react";
import {
  Box,
  Button,
  Typography,
  FormHelperText,
  IconButton,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { VALIDATION_RULES } from "../../../utils/validation";

interface ImageUploadProps {
  onImageSelect: (file: File | undefined) => void;
  error?: string;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  error,
  disabled = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onImageSelect(file);

      // Clean up the file input value to allow selecting the same file again
      event.target.value = "";
    },
    [onImageSelect]
  );

  const handleClear = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onImageSelect(undefined);
  }, [previewUrl, onImageSelect]);

  return (
    <Box>
      <input
        accept={VALIDATION_RULES.IMAGE.ALLOWED_TYPES.join(",")}
        style={{ display: "none" }}
        id="image-upload-input"
        type="file"
        onChange={handleFileSelect}
        disabled={disabled}
      />
      <label htmlFor="image-upload-input">
        <Button
          component="span"
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          disabled={disabled}
          sx={{ mb: 2 }}
        >
          Upload Image
        </Button>
      </label>

      {error && (
        <FormHelperText error sx={{ mb: 1 }}>
          {error}
        </FormHelperText>
      )}

      {previewUrl && (
        <Box
          sx={{
            position: "relative",
            width: "fit-content",
            "&:hover .clear-button": {
              opacity: 1,
            },
          }}
        >
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              maxWidth: "100%",
              maxHeight: "200px",
              objectFit: "contain",
            }}
          />
          <IconButton
            className="clear-button"
            size="small"
            onClick={handleClear}
            disabled={disabled}
            sx={{
              position: "absolute",
              top: -8,
              right: -8,
              backgroundColor: "background.paper",
              opacity: 0,
              transition: "opacity 0.2s",
              "&:hover": {
                backgroundColor: "background.paper",
              },
            }}
          >
            <ClearIcon />
          </IconButton>
        </Box>
      )}

      <Typography variant="caption" color="text.secondary" display="block">
        Supported formats:{" "}
        {VALIDATION_RULES.IMAGE.ALLOWED_TYPES.map((type) =>
          type.split("/")[1].toUpperCase()
        ).join(", ")}
        <br />
        Maximum size: {VALIDATION_RULES.IMAGE.MAX_SIZE / (1024 * 1024)}MB
      </Typography>
    </Box>
  );
};

export { ImageUpload };
