import React from "react";
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
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

export const DashboardPage = () => {
  const { userAttributes } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome back, {userAttributes?.name || "Creator"}!
      </Typography>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                bgcolor: "background.paper",
                borderRadius: 2,
              }}
            >
              <Box sx={{ color: "primary.main", mb: 1 }}>{stat.icon}</Box>
              <Typography variant="h5" component="div">
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Grid container spacing={2}>
              {recentActivity.map((activity, index) => (
                <Grid item xs={12} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1">
                        {activity.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activity.type.charAt(0).toUpperCase() +
                          activity.type.slice(1)}{" "}
                        • {activity.date}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small">View Details</Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button variant="contained" fullWidth>
                  Upload New Video
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button variant="outlined" fullWidth>
                  Create Playlist
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button variant="outlined" fullWidth>
                  View Analytics
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
