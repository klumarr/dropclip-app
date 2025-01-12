import React, { useRef } from "react";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  Chip,
  Box,
  Button,
  IconButton,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { EventDetails, EventFormErrors } from "../../../../types/events";
import { styled } from "@mui/material/styles";

// Styled components
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const ImagePreview = styled(Box)(({ theme }) => ({
  width: "100%",
  height: 200,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "hidden",
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
}));

interface EventDetailsFormProps {
  details: EventDetails;
  errors: EventFormErrors;
  onChange: (details: EventDetails) => void;
}

const eventTypes = [
  "Concert",
  "Festival",
  "Club Night",
  "Private Event",
  "Corporate Event",
  "Other",
];

export const EventDetailsForm: React.FC<EventDetailsFormProps> = ({
  details,
  errors,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof EventDetails, value: any) => {
    onChange({ ...details, [field]: value });
  };

  const handleTagsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const tags = event.target.value.split(",").map((tag) => tag.trim());
    handleChange("tags", tags);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleChange("flyerImage", file);
      const previewUrl = URL.createObjectURL(file);
      handleChange("flyerImageUrl", previewUrl);
    }
  };

  const handleRemoveImage = () => {
    handleChange("flyerImage", null);
    handleChange("flyerImageUrl", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Event Title"
          value={details.title}
          onChange={(e) => handleChange("title", e.target.value)}
          error={!!errors.title}
          helperText={errors.title}
          required
        />
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Event Flyer
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />
          {!details.flyerImageUrl ? (
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              fullWidth
              sx={{ height: 200 }}
            >
              Upload Flyer Image
            </Button>
          ) : (
            <ImagePreview>
              <img src={details.flyerImageUrl} alt="Event flyer preview" />
              <IconButton
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  bgcolor: "background.paper",
                }}
                onClick={handleRemoveImage}
              >
                <DeleteIcon />
              </IconButton>
            </ImagePreview>
          )}
          {errors.flyerImage && (
            <FormHelperText error>{errors.flyerImage}</FormHelperText>
          )}
        </Box>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Description"
          value={details.description}
          onChange={(e) => handleChange("description", e.target.value)}
          error={!!errors.description}
          helperText={errors.description}
          multiline
          rows={4}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors.type} required>
          <InputLabel>Event Type</InputLabel>
          <Select
            value={details.type}
            onChange={(e) => handleChange("type", e.target.value)}
            label="Event Type"
          >
            {eventTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
          {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Tags"
          value={details.tags.join(", ")}
          onChange={handleTagsChange}
          error={!!errors.tags}
          helperText={errors.tags || "Separate tags with commas"}
        />
        {details.tags.length > 0 && (
          <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {details.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() =>
                  handleChange(
                    "tags",
                    details.tags.filter((t) => t !== tag)
                  )
                }
                size="small"
              />
            ))}
          </Box>
        )}
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Start Date"
          type="date"
          value={details.date}
          onChange={(e) => handleChange("date", e.target.value)}
          error={!!errors.date}
          helperText={errors.date}
          InputLabelProps={{ shrink: true }}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Start Time"
          type="time"
          value={details.time}
          onChange={(e) => handleChange("time", e.target.value)}
          error={!!errors.time}
          helperText={errors.time}
          InputLabelProps={{ shrink: true }}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="End Date"
          type="date"
          value={details.endDate}
          onChange={(e) => handleChange("endDate", e.target.value)}
          error={!!errors.endDate}
          helperText={errors.endDate}
          InputLabelProps={{ shrink: true }}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="End Time"
          type="time"
          value={details.endTime}
          onChange={(e) => handleChange("endTime", e.target.value)}
          error={!!errors.endTime}
          helperText={errors.endTime}
          InputLabelProps={{ shrink: true }}
          required
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Venue"
          value={details.venue}
          onChange={(e) => handleChange("venue", e.target.value)}
          error={!!errors.venue}
          helperText={errors.venue}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="City"
          value={details.city}
          onChange={(e) => handleChange("city", e.target.value)}
          error={!!errors.city}
          helperText={errors.city}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Country"
          value={details.country}
          onChange={(e) => handleChange("country", e.target.value)}
          error={!!errors.country}
          helperText={errors.country}
          required
        />
      </Grid>
    </Grid>
  );
};
