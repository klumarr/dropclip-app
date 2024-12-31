import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { eventOperations } from "../services/dynamodb.service";
import { v4 as uuidv4 } from "uuid";
import { EventItem } from "../types/dynamodb";

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flyerFile, setFlyerFile] = useState<File | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const date = formData.get("date") as string;
      const eventData: Omit<EventItem, "createdAt" | "updatedAt" | "imageUrl"> =
        {
          id: uuidv4(),
          creativeId: user?.id || "",
          name: formData.get("name") as string,
          description: formData.get("description") as string,
          date,
          location: formData.get("location") as string,
          dateId: date.substring(0, 7), // YYYY-MM
          dateCreativeId: `${date}#${user?.id || ""}`,
        };

      await eventOperations.createEvent(eventData, flyerFile || undefined);
      navigate("/events");
    } catch (err) {
      console.error("Failed to create event:", err);
      setError("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFlyerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFlyerFile(event.target.files[0]);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Event
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Event Name"
            name="name"
            autoFocus
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="description"
            label="Description"
            name="description"
            multiline
            rows={4}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="date"
            label="Event Date"
            name="date"
            type="date"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="location"
            label="Location"
            name="location"
          />

          <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
            Upload Event Flyer
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleFlyerChange}
            />
          </Button>

          {flyerFile && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected file: {flyerFile.name}
            </Typography>
          )}

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? "Creating Event..." : "Create Event"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};
