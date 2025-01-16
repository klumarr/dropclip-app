import React, { useCallback } from "react";
import { Grid, Alert } from "@mui/material";
import { useEventForm } from "../../../../hooks/useEventForm";
import { EventFormData, EventDetails } from "../../../../types/events";
import { UploadConfigForm } from "./UploadConfigForm";
import { CreateEventFormProps } from "./types";
import { EventDetailsForm } from "../EventDetailsForm";

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

  const handleDetailsChange = useCallback(
    (field: keyof EventDetails, value: any) => {
      handleChange(field as keyof EventFormData, value);
    },
    [handleChange]
  );

  return (
    <Grid container spacing={3} sx={{ mt: 1 }}>
      {formError && (
        <Grid item xs={12}>
          <Alert severity="error">{formError.message}</Alert>
        </Grid>
      )}

      <Grid item xs={12}>
        <EventDetailsForm
          details={{
            ...formData,
            suggestedTags: formData.suggestedTags || [],
            endDate: formData.endDate || "",
            endTime: formData.endTime || "",
          }}
          errors={errors}
          onChange={handleDetailsChange}
          onImageChange={handleImageChange}
        />
      </Grid>

      <Grid item xs={12}>
        <UploadConfigForm
          config={formData.uploadConfig}
          onChange={handleUploadConfigChange}
          errors={errors.uploadConfig || {}}
        />
      </Grid>
    </Grid>
  );
};
