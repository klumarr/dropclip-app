import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  VideoLibrary,
  Favorite,
  PlaylistPlay,
  Timeline,
  CloudDownload,
  Event,
  Upload,
  Settings,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { UserType } from "../types/auth.types";

export const DashboardPage = () => {
  const { userAttributes } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const stats = [
    { icon: <VideoLibrary />, label: "Total Videos", value: "42" },
    { icon: <Favorite />, label: "Total Likes", value: "1.2K" },
    { icon: <PlaylistPlay />, label: "Playlists", value: "8" },
    { icon: <Timeline />, label: "Views", value: "15.6K" },
  ];

  const recentActivity = [
    { type: "upload", title: "Summer Vibes Mix", date: "2 hours ago" },
    { type: "like", title: "Beach Sunset", date: "5 hours ago" },
    { type: "playlist", title: "Chill Beats", date: "1 day ago" },
  ];

  const fanFeatures = [
    {
      title: "My Playlists",
      description: "Create and manage your video playlists",
      icon: <PlaylistPlay fontSize="large" />,
      action: () => navigate("/playlists"),
    },
    {
      title: "Upload Center",
      description: "Upload your event videos to share with creatives",
      icon: <Upload fontSize="large" />,
      action: () => navigate("/upload"),
    },
    {
      title: "Settings",
      description: "Manage your account settings",
      icon: <Settings fontSize="large" />,
      action: () => navigate("/settings"),
    },
  ];

  const creativeFeatures = [
    {
      title: "Events",
      description: "Manage your events and generate upload links",
      icon: <Event fontSize="large" />,
      action: () => navigate("/events"),
    },
    {
      title: "Download Center",
      description: "Download and manage fan-submitted videos",
      icon: <CloudDownload fontSize="large" />,
      action: () => navigate("/downloads"),
    },
    {
      title: "My Playlists",
      description: "Organize and showcase your videos",
      icon: <PlaylistPlay fontSize="large" />,
      action: () => navigate("/playlists"),
    },
    {
      title: "Settings",
      description: "Manage your account settings",
      icon: <Settings fontSize="large" />,
      action: () => navigate("/settings"),
    },
  ];

  const features = userAttributes?.userType
    ? userAttributes.userType === UserType.CREATIVE
      ? creativeFeatures
      : fanFeatures
    : fanFeatures; // Default to fan features if userType is undefined

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome back{userAttributes?.name ? `, ${userAttributes.name}` : ""}
      </Typography>

      {/* Stats Grid */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                bgcolor: "background.paper",
              }}
            >
              {stat.icon}
              <Typography variant="h6" sx={{ mt: 1 }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Feature Navigation Cards */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  {feature.icon}
                  <Typography variant="h6">{feature.title}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={feature.action}
                  startIcon={feature.icon}
                >
                  Go to {feature.title}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Recent Activity
      </Typography>
      <Grid container spacing={2}>
        {recentActivity.map((activity, index) => (
          <Grid item xs={12} key={index}>
            <Paper sx={{ p: 2 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="subtitle1">{activity.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activity.type}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {activity.date}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
