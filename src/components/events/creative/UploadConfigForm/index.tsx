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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { UploadConfig, EventFormErrors } from "../../../../types/events";

interface UploadConfigFormProps {
  config: UploadConfig;
  errors: EventFormErrors;
  onChange: (config: UploadConfig) => void;
}

const allowedFileTypes = ["video/*", "image/*"];
const maxFileSizes = [50, 100, 200, 500];

export const UploadConfigForm: React.FC<UploadConfigFormProps> = ({
  config,
  errors,
  onChange,
}) => {
  const handleChange = (field: keyof UploadConfig, value: any) => {
    onChange({ ...config, [field]: value });
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
      </Grid>

      {config.enabled && (
        <>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Time"
              type="datetime-local"
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
              label="End Time"
              type="datetime-local"
              value={config.endTime}
              onChange={(e) => handleChange("endTime", e.target.value)}
              error={!!errors.endTime}
              helperText={errors.endTime}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Allowed File Types
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {allowedFileTypes.map((type) => (
                <Chip
                  key={type}
                  label={type === "video/*" ? "Videos" : "Images"}
                  onClick={() => {
                    const types = config.allowedTypes.includes(type)
                      ? config.allowedTypes.filter((t) => t !== type)
                      : [...config.allowedTypes, type];
                    handleChange("allowedTypes", types);
                  }}
                  color={
                    config.allowedTypes.includes(type) ? "primary" : "default"
                  }
                  variant={
                    config.allowedTypes.includes(type) ? "filled" : "outlined"
                  }
                />
              ))}
            </Box>
            {errors.allowedTypes && (
              <FormHelperText error>{errors.allowedTypes}</FormHelperText>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.maxFileSize}>
              <InputLabel>Maximum File Size (MB)</InputLabel>
              <Select
                value={config.maxFileSize}
                onChange={(e) => handleChange("maxFileSize", e.target.value)}
                label="Maximum File Size (MB)"
              >
                {maxFileSizes.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size} MB
                  </MenuItem>
                ))}
              </Select>
              {errors.maxFileSize && (
                <FormHelperText>{errors.maxFileSize}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Maximum Files per User"
              type="number"
              value={config.maxFiles}
              onChange={(e) =>
                handleChange("maxFiles", parseInt(e.target.value, 10))
              }
              error={!!errors.maxFiles}
              helperText={errors.maxFiles}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>
        </>
      )}
    </Grid>
  );
};
