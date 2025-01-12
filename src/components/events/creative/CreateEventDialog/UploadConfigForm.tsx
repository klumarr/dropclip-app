import React from "react";
import {
  Grid,
  TextField,
  Box,
  Switch,
  FormControlLabel,
  Typography,
  Chip,
  FormHelperText,
} from "@mui/material";
import { UploadConfig } from "../../../../types/events";

interface UploadConfigFormProps {
  config: UploadConfig;
  errors: Record<string, string>;
  onChange: (config: UploadConfig) => void;
}

const allowedFileTypes = ["video/*", "image/*"];
const maxFileSizes = [50, 100, 200, 500];

const UploadConfigForm: React.FC<UploadConfigFormProps> = ({
  config,
  errors,
  onChange,
}) => {
  console.log("UploadConfigForm: Rendering form");

  const handleChange = (field: keyof UploadConfig, value: any) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={config.enabled}
              onChange={(e) => handleChange("enabled", e.target.checked)}
            />
          }
          label="Enable fan uploads"
        />
        <FormHelperText>
          Allow fans to upload content during the specified time window
        </FormHelperText>
      </Grid>

      {config.enabled && (
        <>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Upload Start Time"
              value={config.startTime}
              onChange={(e) => handleChange("startTime", e.target.value)}
              error={!!errors.startTime}
              helperText={errors.startTime}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Upload End Time"
              value={config.endTime}
              onChange={(e) => handleChange("endTime", e.target.value)}
              error={!!errors.endTime}
              helperText={errors.endTime}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Allowed File Types
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {allowedFileTypes.map((type) => (
                <Chip
                  key={type}
                  label={type.replace("/*", "s")}
                  onClick={() =>
                    handleChange(
                      "allowedTypes",
                      config.allowedTypes?.includes(type)
                        ? config.allowedTypes.filter((t) => t !== type)
                        : [...(config.allowedTypes || []), type]
                    )
                  }
                  color={
                    config.allowedTypes?.includes(type) ? "primary" : "default"
                  }
                  variant={
                    config.allowedTypes?.includes(type) ? "filled" : "outlined"
                  }
                />
              ))}
            </Box>
            {errors.allowedTypes && (
              <FormHelperText error>{errors.allowedTypes}</FormHelperText>
            )}
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Maximum File Size (MB)
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {maxFileSizes.map((size) => (
                <Chip
                  key={size}
                  label={`${size}MB`}
                  onClick={() => handleChange("maxFileSize", size)}
                  color={config.maxFileSize === size ? "primary" : "default"}
                  variant={config.maxFileSize === size ? "filled" : "outlined"}
                />
              ))}
            </Box>
            {errors.maxFileSize && (
              <FormHelperText error>{errors.maxFileSize}</FormHelperText>
            )}
          </Grid>
        </>
      )}
    </Grid>
  );
};

export { UploadConfigForm };
