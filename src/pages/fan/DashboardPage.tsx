import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Search, Event, VideoLibrary, Favorite } from "@mui/icons-material";

const DashboardPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { userAttributes } = useAuth();

  const quickActions = [
    {
      title: "Discover",
      description: "Find new videos and creators",
      icon: Search,
      path: "/fan/search",
    },
    {
      title: "Events",
      description: "View upcoming and past events",
      icon: Event,
      path: "/fan/events",
    },
    {
      title: "My Playlists",
      description: "Access your saved playlists",
      icon: VideoLibrary,
      path: "/fan/playlists",
    },
    {
      title: "Following",
      description: "See updates from your favorite creators",
      icon: Favorite,
      path: "/fan/following",
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome back{userAttributes?.name ? `, ${userAttributes.name}` : ""}
      </Typography>

      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Quick Actions
      </Typography>

      <Grid container spacing={3}>
        {quickActions.map((action) => (
          <Grid item xs={12} sm={6} md={3} key={action.title}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                "&:hover": {
                  boxShadow: theme.shadows[8],
                },
              }}
              onClick={() => navigate(action.path)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                    color: "primary.main",
                  }}
                >
                  <action.icon sx={{ fontSize: 32, mr: 1 }} />
                  <Typography variant="h6">{action.title}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Upcoming Events
        </Typography>
        {/* Add upcoming events component here */}
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Recent Uploads from Creators You Follow
        </Typography>
        {/* Add recent uploads component here */}
      </Box>
    </Box>
  );
};

export default DashboardPage;
