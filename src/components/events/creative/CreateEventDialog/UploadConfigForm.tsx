import React from "react";
import {
  Grid,
  TextField,
  FormControl,
  FormControlLabel,
  Switch,
  FormHelperText,
  InputAdornment,
} from "@mui/material";
import { UploadConfigFormProps } from "./types";

const UploadConfigForm: React.FC<UploadConfigFormProps> = ({
  config,
  onChange,
  errors,
}) => {
  const handleChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "enabled"
          ? event.target.checked
          : field === "maxFileSize"
          ? Number(event.target.value)
          : event.target.value;
      onChange(field as keyof typeof config, value);
    };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={config.enabled}
              onChange={handleChange("enabled")}
              color="primary"
            />
          }
          label="Enable Fan Upload"
        />
      </Grid>

      {config.enabled && (
        <>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.startDate}>
              <TextField
                type="date"
                label="Upload Start Date"
                value={config.startDate}
                onChange={handleChange("startDate")}
                error={!!errors.startDate}
                helperText={errors.startDate}
                required
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.endDate}>
              <TextField
                type="date"
                label="Upload End Date"
                value={config.endDate}
                onChange={handleChange("endDate")}
                error={!!errors.endDate}
                helperText={errors.endDate}
                required
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.startTime}>
              <TextField
                type="time"
                label="Upload Start Time"
                value={config.startTime}
                onChange={handleChange("startTime")}
                error={!!errors.startTime}
                helperText={errors.startTime}
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.endTime}>
              <TextField
                type="time"
                label="Upload End Time"
                value={config.endTime}
                onChange={handleChange("endTime")}
                error={!!errors.endTime}
                helperText={errors.endTime}
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.maxFileSize}>
              <TextField
                type="number"
                label="Max File Size"
                value={config.maxFileSize}
                onChange={handleChange("maxFileSize")}
                error={!!errors.maxFileSize}
                helperText={errors.maxFileSize}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">MB</InputAdornment>
                  ),
                }}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.allowedTypes}>
              <TextField
                label="Allowed File Types"
                value={config.allowedTypes.join(", ")}
                onChange={handleChange("allowedTypes")}
                error={!!errors.allowedTypes}
                helperText={
                  errors.allowedTypes ||
                  "Enter file types separated by commas (e.g., image/*, video/*)"
                }
                required
              />
            </FormControl>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default UploadConfigForm;
