import React from "react";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  FormHelperText,
} from "@mui/material";
import { UploadConfig, EventFormErrors } from "../../../../types/events";

interface UploadConfigFormProps {
  config: UploadConfig;
  onChange: (field: string, value: any) => void;
  errors: EventFormErrors;
}

export const UploadConfigForm: React.FC<UploadConfigFormProps> = ({
  config,
  onChange,
  errors,
}) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Video Upload Configuration
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="date"
          label="Upload Start Date"
          value={config.startDate}
          onChange={(e) => onChange("startDate", e.target.value)}
          error={!!errors["uploadConfig.startDate"]}
          helperText={errors["uploadConfig.startDate"]}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="date"
          label="Upload End Date"
          value={config.endDate}
          onChange={(e) => onChange("endDate", e.target.value)}
          error={!!errors["uploadConfig.endDate"]}
          helperText={errors["uploadConfig.endDate"]}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Max File Size (MB)</InputLabel>
          <Select
            value={config.maxFileSize}
            onChange={(e) => onChange("maxFileSize", e.target.value)}
            label="Max File Size (MB)"
          >
            <MenuItem value={50}>50 MB</MenuItem>
            <MenuItem value={100}>100 MB</MenuItem>
            <MenuItem value={200}>200 MB</MenuItem>
            <MenuItem value={500}>500 MB</MenuItem>
          </Select>
          <FormHelperText>Maximum file size for video uploads</FormHelperText>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Allowed File Types</InputLabel>
          <Select
            multiple
            value={config.allowedTypes}
            onChange={(e) => onChange("allowedTypes", e.target.value)}
            label="Allowed File Types"
          >
            <MenuItem value="video/mp4">MP4</MenuItem>
            <MenuItem value="video/quicktime">MOV</MenuItem>
            <MenuItem value="video/x-msvideo">AVI</MenuItem>
          </Select>
          <FormHelperText>Supported video file formats</FormHelperText>
        </FormControl>
      </Grid>
    </Grid>
  );
};
