import React from "react";
import { Grid, TextField, FormControl, FormHelperText } from "@mui/material";
import { CreateEventFormProps } from "./types";

const CreateEventForm: React.FC<CreateEventFormProps> = ({
  formData,
  onChange,
  errors,
}) => {
  const handleChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(field as keyof typeof formData, event.target.value);
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

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors.date}>
          <TextField
            type="date"
            label="Event Date"
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
        <FormControl fullWidth>
          <TextField
            type="time"
            label="Start Time"
            value={formData.startTime}
            onChange={handleChange("startTime")}
            InputLabelProps={{ shrink: true }}
          />
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <TextField
            type="time"
            label="End Time"
            value={formData.endTime}
            onChange={handleChange("endTime")}
            InputLabelProps={{ shrink: true }}
          />
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <FormControl fullWidth>
          <TextField
            label="Description"
            value={formData.description}
            onChange={handleChange("description")}
            multiline
            rows={4}
          />
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <FormControl fullWidth>
          <TextField
            label="Ticket Link"
            value={formData.ticketLink}
            onChange={handleChange("ticketLink")}
            placeholder="https://"
          />
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default CreateEventForm;
