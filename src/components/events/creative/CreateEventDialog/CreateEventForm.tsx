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
          label="Event Name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
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
          value={formData.time}
          onChange={(e) => handleChange("time", e.target.value)}
          error={!!errors.time}
          helperText={errors.time}
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

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Venue"
          value={formData.venue}
          onChange={(e) => handleChange("venue", e.target.value)}
          error={!!errors.venue}
          helperText={errors.venue}
        />
      </Grid>

      <Grid item xs={12} sm={3}>
        <TextField
          fullWidth
          label="City"
          value={formData.city}
          onChange={(e) => handleChange("city", e.target.value)}
          error={!!errors.city}
          helperText={errors.city}
        />
      </Grid>

      <Grid item xs={12} sm={3}>
        <TextField
          fullWidth
          label="Country"
          value={formData.country}
          onChange={(e) => handleChange("country", e.target.value)}
          error={!!errors.country}
          helperText={errors.country}
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
          imageUrl={formData.flyerUrl}
          onImageUpload={handleImageChange}
          onImageRemove={() => handleImageChange(undefined)}
          error={errors.flyerImage}
        />
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.uploadConfig.enabled}
              onChange={(e) =>
                handleUploadConfigChange({
                  ...formData.uploadConfig,
                  enabled: e.target.checked,
                })
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
            errors={errors.uploadConfig || {}}
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
