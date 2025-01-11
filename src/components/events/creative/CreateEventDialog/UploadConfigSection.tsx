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
import { UploadConfig } from "../../../../types/events";
import { VALIDATION_RULES } from "../../../../utils/validation";

interface UploadConfigSectionProps {
  uploadConfig: UploadConfig;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}

export const UploadConfigSection: React.FC<UploadConfigSectionProps> = ({
  uploadConfig,
  onChange,
  errors,
  disabled = false,
}) => {
  const handleAllowedTypesChange = (value: string[]) => {
    onChange("allowedTypes", value);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Video Upload Settings
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="date"
          label="Upload Start Date"
          value={uploadConfig.startDate}
          onChange={(e) => onChange("startDate", e.target.value)}
          error={!!errors["uploadConfig.startDate"]}
          helperText={errors["uploadConfig.startDate"]}
          InputLabelProps={{ shrink: true }}
          disabled={disabled}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="date"
          label="Upload End Date"
          value={uploadConfig.endDate}
          onChange={(e) => onChange("endDate", e.target.value)}
          error={!!errors["uploadConfig.endDate"]}
          helperText={errors["uploadConfig.endDate"]}
          InputLabelProps={{ shrink: true }}
          disabled={disabled}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="number"
          label="Max File Size (MB)"
          value={uploadConfig.maxFileSize}
          onChange={(e) => onChange("maxFileSize", Number(e.target.value))}
          error={!!errors["uploadConfig.maxFileSize"]}
          helperText={
            errors["uploadConfig.maxFileSize"] ||
            `Enter a value between ${VALIDATION_RULES.UPLOAD_CONFIG.MAX_FILE_SIZE.MIN} and ${VALIDATION_RULES.UPLOAD_CONFIG.MAX_FILE_SIZE.MAX} MB`
          }
          inputProps={{
            min: VALIDATION_RULES.UPLOAD_CONFIG.MAX_FILE_SIZE.MIN,
            max: VALIDATION_RULES.UPLOAD_CONFIG.MAX_FILE_SIZE.MAX,
          }}
          disabled={disabled}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl
          fullWidth
          error={!!errors["uploadConfig.allowedTypes"]}
          disabled={disabled}
        >
          <InputLabel id="allowed-types-label">Allowed File Types</InputLabel>
          <Select
            labelId="allowed-types-label"
            multiple
            value={uploadConfig.allowedTypes}
            onChange={(e) =>
              handleAllowedTypesChange(e.target.value as string[])
            }
            label="Allowed File Types"
          >
            <MenuItem value="video/mp4">MP4</MenuItem>
            <MenuItem value="video/quicktime">QuickTime</MenuItem>
            <MenuItem value="video/x-msvideo">AVI</MenuItem>
            <MenuItem value="video/x-matroska">MKV</MenuItem>
          </Select>
          {errors["uploadConfig.allowedTypes"] && (
            <FormHelperText>
              {errors["uploadConfig.allowedTypes"]}
            </FormHelperText>
          )}
        </FormControl>
      </Grid>
    </Grid>
  );
};
