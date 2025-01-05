import React from "react";
import { Grid, TextField, FormControl, FormHelperText } from "@mui/material";
import { CreateEventFormProps } from "./types";
import ImageUpload from "./ImageUpload";

const CreateEventForm: React.FC<CreateEventFormProps> = ({
  formData,
  onChange,
  errors,
}) => {
  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(field as keyof typeof formData, e.target.value);
    };

  const handleImageUpload = (file: File) => {
    onChange("imageFile", file);
  };

  const handleImageRemove = () => {
    onChange("imageFile", undefined);
    onChange("imageUrl", "");
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormControl fullWidth error={!!errors.title}>
          <TextField
            label="Event Title"
            value={formData.title}
            onChange={handleChange("title")}
            error={!!errors.title}
            helperText={errors.title}
            required
          />
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <ImageUpload
          imageUrl={formData.imageUrl}
          onImageUpload={handleImageUpload}
          onImageRemove={handleImageRemove}
          error={errors.imageFile}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors.date}>
          <TextField
            type="date"
            label="Date"
            value={formData.date}
            onChange={handleChange("date")}
            error={!!errors.date}
            helperText={errors.date}
            required
            InputLabelProps={{ shrink: true }}
          />
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors.location}>
          <TextField
            label="Location"
            value={formData.location}
            onChange={handleChange("location")}
            error={!!errors.location}
            helperText={errors.location}
            required
          />
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors.startTime}>
          <TextField
            type="time"
            label="Start Time"
            value={formData.startTime}
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
            label="End Time"
            value={formData.endTime}
            onChange={handleChange("endTime")}
            error={!!errors.endTime}
            helperText={errors.endTime}
            InputLabelProps={{ shrink: true }}
          />
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <FormControl fullWidth error={!!errors.ticketLink}>
          <TextField
            label="Ticket Link"
            value={formData.ticketLink}
            onChange={handleChange("ticketLink")}
            error={!!errors.ticketLink}
            helperText={errors.ticketLink}
          />
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <FormControl fullWidth error={!!errors.description}>
          <TextField
            label="Description"
            value={formData.description}
            onChange={handleChange("description")}
            error={!!errors.description}
            helperText={errors.description}
            multiline
            rows={4}
          />
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default CreateEventForm;
