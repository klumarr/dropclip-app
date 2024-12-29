import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  styled,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

const ScrollSection = styled(Box)(({ theme }) => ({
  overflowX: "auto",
  whiteSpace: "nowrap",
  padding: theme.spacing(2, 0),
  "&::-webkit-scrollbar": {
    height: 12,
  },
  "&::-webkit-scrollbar-track": {
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: 6,
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 6,
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
  },
}));

const EventCard = styled(Card)(({ theme }) => ({
  display: "inline-block",
  width: 280,
  marginRight: theme.spacing(2),
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  transition: "transform 0.2s, background-color 0.2s",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    transform: "translateY(-4px)",
  },
  whiteSpace: "normal",
}));

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  imageUrl?: string;
  isAutomatic?: boolean;
}

const EventsPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Mock data - replace with real data from API
  const upcomingEvents: Event[] = [
    {
      id: "1",
      title: "Summer Festival 2024",
      date: "2024-07-15",
      location: "Central Park, NY",
      description: "Annual summer music festival featuring local artists",
      imageUrl: "https://example.com/event1.jpg",
    },
  ];

  const pastEvents: Event[] = [
    {
      id: "2",
      title: "Winter Concert 2023",
      date: "2023-12-20",
      location: "Madison Square Garden",
      description: "End of year special performance",
      imageUrl: "https://example.com/event2.jpg",
    },
  ];

  const automaticEvents: Event[] = [
    {
      id: "3",
      title: "Club Performance",
      date: "2024-08-01",
      location: "Blue Note Jazz Club",
      description: "Found from Instagram post",
      imageUrl: "https://example.com/event3.jpg",
      isAutomatic: true,
    },
  ];

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsCreateDialogOpen(true);
  };

  const handleSaveEvent = () => {
    // Save event logic here
    setIsCreateDialogOpen(false);
  };

  const handleApproveAutoEvent = (event: Event) => {
    // Move automatic event to upcoming events
    console.log("Approving auto event:", event);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1">
          Events
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateEvent}
        >
          Create Event
        </Button>
      </Box>

      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          Upcoming Events
        </Typography>
        <ScrollSection>
          {upcomingEvents.map((event) => (
            <EventCard key={event.id}>
              {event.imageUrl && (
                <CardMedia
                  component="img"
                  height="140"
                  image={event.imageUrl}
                  alt={event.title}
                />
              )}
              <CardContent>
                <Typography variant="h6" noWrap>
                  {event.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(event.date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {event.location}
                </Typography>
                <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleEditEvent(event)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </EventCard>
          ))}
        </ScrollSection>
      </Box>

      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          Past Events
        </Typography>
        <ScrollSection>
          {pastEvents.map((event) => (
            <EventCard key={event.id}>
              {event.imageUrl && (
                <CardMedia
                  component="img"
                  height="140"
                  image={event.imageUrl}
                  alt={event.title}
                />
              )}
              <CardContent>
                <Typography variant="h6" noWrap>
                  {event.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(event.date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {event.location}
                </Typography>
              </CardContent>
            </EventCard>
          ))}
        </ScrollSection>
      </Box>

      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          Automatic Events
        </Typography>
        <ScrollSection>
          {automaticEvents.map((event) => (
            <EventCard key={event.id}>
              {event.imageUrl && (
                <CardMedia
                  component="img"
                  height="140"
                  image={event.imageUrl}
                  alt={event.title}
                />
              )}
              <CardContent>
                <Typography variant="h6" noWrap>
                  {event.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(event.date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {event.location}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleApproveAutoEvent(event)}
                  >
                    Approve & Add
                  </Button>
                </Box>
              </CardContent>
            </EventCard>
          ))}
        </ScrollSection>
      </Box>

      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedEvent ? "Edit Event" : "Create New Event"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Title"
                  defaultValue={selectedEvent?.title}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  defaultValue={selectedEvent?.date}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  defaultValue={selectedEvent?.location}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  defaultValue={selectedEvent?.description}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEvent}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventsPage;
