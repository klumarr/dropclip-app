import { Box, Typography, Grid, Paper } from "@mui/material";
import { ProfileAnalytics } from "../components/analytics/ProfileAnalytics";
import { useAuth } from "../contexts/AuthContext";
import { UserType } from "../types/auth.types";

export const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Welcome back, {user.email.split("@")[0]}!
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {user.userType === UserType.CREATIVE
                ? "Here's how your content is performing"
                : "Discover new content from your favorite creatives"}
            </Typography>
          </Paper>
        </Grid>

        {/* Analytics Section for Creative Users */}
        {user.userType === UserType.CREATIVE && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <ProfileAnalytics
                userId={user.id}
                userType={user.userType}
                creativeCategory={user.creativeCategory}
              />
            </Paper>
          </Grid>
        )}

        {/* Recent Activity Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Coming soon...
            </Typography>
          </Paper>
        </Grid>

        {/* Upcoming Events Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Events
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Coming soon...
            </Typography>
          </Paper>
        </Grid>

        {/* Latest Videos Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Latest Videos
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Coming soon...
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
