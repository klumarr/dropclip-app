import React, { useCallback } from "react";
import {
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Typography,
  Alert,
  Box,
} from "@mui/material";
import { useEventForm } from "../../../../hooks/useEventForm";
import { EventFormData } from "../../../../types/events";
import { ImageUpload } from "./ImageUpload";
import { UploadConfigForm } from "./UploadConfigForm";
import { CreateEventFormProps } from "./types";

export const CreateEventForm: React.FC<CreateEventFormProps> = ({
  formData: initialFormData,
  onChange,
  errors: propErrors,
  onSubmit,
  formError,
}) => {
  const {
    formData,
    errors,
    isDirty,
    isValid,
    handleChange,
    handleUploadConfigChange,
    handleImageChange,
    validateForm,
  } = useEventForm(initialFormData);

  const handleFormSubmit = useCallback(async () => {
    if (!validateForm()) return;
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error("Form submission error:", err);
    }
  }, [formData, validateForm, onSubmit]);

  return (
    <Grid container spacing={3} sx={{ mt: 1 }}>
      {formError && (
        <Grid item xs={12}>
          <Alert severity="error">{formError.message}</Alert>
        </Grid>
      )}

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Title"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          error={!!errors.title}
          helperText={errors.title}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Description"
          multiline
          rows={4}
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          error={!!errors.description}
          helperText={errors.description}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="date"
          label="Date"
          value={formData.date}
          onChange={(e) => handleChange("date", e.target.value)}
          error={!!errors.date}
          helperText={errors.date}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} sm={3}>
        <TextField
          fullWidth
          type="time"
          label="Start Time"
          value={formData.startTime}
          onChange={(e) => handleChange("startTime", e.target.value)}
          error={!!errors.startTime}
          helperText={errors.startTime}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} sm={3}>
        <TextField
          fullWidth
          type="time"
          label="End Time"
          value={formData.endTime}
          onChange={(e) => handleChange("endTime", e.target.value)}
          error={!!errors.endTime}
          helperText={errors.endTime}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Location"
          value={formData.location}
          onChange={(e) => handleChange("location", e.target.value)}
          error={!!errors.location}
          helperText={errors.location}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Ticket Link (Optional)"
          value={formData.ticketLink}
          onChange={(e) => handleChange("ticketLink", e.target.value)}
          error={!!errors.ticketLink}
          helperText={errors.ticketLink}
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Event Image
        </Typography>
        <ImageUpload
          imageUrl={formData.imageUrl}
          onImageUpload={handleImageChange}
          onImageRemove={() => handleImageChange(undefined)}
          error={errors.imageFile}
        />
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.uploadConfig.enabled}
              onChange={(e) =>
                handleUploadConfigChange("enabled", e.target.checked)
              }
            />
          }
          label="Enable Video Upload"
        />
      </Grid>

      {formData.uploadConfig.enabled && (
        <Grid item xs={12}>
          <UploadConfigForm
            config={formData.uploadConfig}
            onChange={handleUploadConfigChange}
            errors={errors}
          />
        </Grid>
      )}

      <Grid item xs={12}>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            onClick={handleFormSubmit}
            disabled={!isDirty || !isValid}
          >
            Create Event
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
};
