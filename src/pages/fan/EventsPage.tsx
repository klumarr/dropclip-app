import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  MoreVert,
  Share,
  Event,
  LocationOn,
  People,
  Star,
  StarBorder,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface FanEvent {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  attendees: number;
  isInterested: boolean;
  status: "upcoming" | "past" | "live";
}

const EventsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  // Mock data - replace with actual data from API
  const events: FanEvent[] = [
    {
      id: "1",
      title: "Summer Music Festival",
      description: "Annual electronic music festival featuring top DJs",
      thumbnailUrl: "https://via.placeholder.com/320x180",
      date: "2024-07-15",
      time: "14:00",
      location: "Central Park, New York",
      organizer: "Event Productions Inc.",
      attendees: 1500,
      isInterested: false,
      status: "upcoming",
    },
    // Add more mock events here
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    eventId: string
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedEvent(eventId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEvent(null);
  };

  const handleShare = () => {
    if (selectedEvent) {
      // Implement share functionality
      console.log("Share event:", selectedEvent);
    }
    handleMenuClose();
  };

  const handleToggleInterest = (eventId: string) => {
    // Implement toggle interest functionality
    console.log("Toggle interest for event:", eventId);
  };

  const getStatusColor = (status: FanEvent["status"]) => {
    switch (status) {
      case "live":
        return "error";
      case "upcoming":
        return "primary";
      case "past":
        return "default";
    }
  };

  const filteredEvents = events.filter((event) => {
    switch (activeTab) {
      case 0:
        return event.status === "upcoming";
      case 1:
        return event.status === "live";
      case 2:
        return event.status === "past";
      default:
        return true;
    }
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Events
      </Typography>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ mb: 3 }}
        variant={isMobile ? "scrollable" : "standard"}
        scrollButtons={isMobile ? "auto" : false}
      >
        <Tab label="Upcoming" />
        <Tab label="Live Now" />
        <Tab label="Past" />
      </Tabs>

      <Grid container spacing={3}>
        {filteredEvents.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <Card>
              <Box sx={{ position: "relative" }}>
                <CardMedia
                  component="img"
                  height={180}
                  image={event.thumbnailUrl}
                  alt={event.title}
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/fan/events/${event.id}`)}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    display: "flex",
                    gap: 1,
                  }}
                >
                  <Chip
                    label={event.status.toUpperCase()}
                    color={getStatusColor(event.status)}
                    size="small"
                  />
                </Box>
              </Box>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{ flex: 1, pr: 2 }}>
                    <Typography variant="h6" noWrap>
                      {event.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        mb: 1,
                      }}
                    >
                      {event.description}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, event.id)}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Event sx={{ mr: 1, fontSize: "1rem" }} />
                  <Typography variant="body2">
                    {new Date(event.date).toLocaleDateString()} at {event.time}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <LocationOn sx={{ mr: 1, fontSize: "1rem" }} />
                  <Typography variant="body2" noWrap>
                    {event.location}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <People sx={{ mr: 0.5, fontSize: "1rem" }} />
                    <Typography variant="body2" color="text.secondary">
                      {event.attendees} attending
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleInterest(event.id)}
                    color={event.isInterested ? "primary" : "default"}
                  >
                    {event.isInterested ? <Star /> : <StarBorder />}
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleShare}>
          <Share sx={{ mr: 1 }} /> Share
        </MenuItem>
      </Menu>

      {filteredEvents.length === 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
            textAlign: "center",
          }}
        >
          <Event sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No{" "}
            {activeTab === 0 ? "upcoming" : activeTab === 1 ? "live" : "past"}{" "}
            events found
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/fan/search")}
          >
            Discover Events
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default EventsPage;
