import React from "react";
import { Box, Typography, Grid, Paper, styled } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  transition: "transform 0.2s, background-color 0.2s",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    transform: "translateY(-4px)",
  },
}));

const DashboardPage: React.FC = () => {
  const { userAttributes } = useAuth();
  const isCreative = userAttributes?.userType === "CREATOR";

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            {isCreative ? (
              <>
                <Typography>Total Views: 1,234</Typography>
                <Typography>Total Subscribers: 567</Typography>
                <Typography>Recent Events: 3</Typography>
              </>
            ) : (
              <>
                <Typography>Watched Videos: 45</Typography>
                <Typography>Liked Videos: 12</Typography>
                <Typography>Playlists Created: 5</Typography>
              </>
            )}
          </StyledPaper>
        </Grid>

        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            {isCreative ? (
              <>
                <Typography>New subscribers: +23 this week</Typography>
                <Typography>Latest video performance: 456 views</Typography>
                <Typography>Upcoming events: 2 this month</Typography>
              </>
            ) : (
              <>
                <Typography>Recently watched: Video Title</Typography>
                <Typography>Last playlist update: 2 days ago</Typography>
                <Typography>
                  New content from subscriptions: 8 videos
                </Typography>
              </>
            )}
          </StyledPaper>
        </Grid>

        {isCreative && (
          <Grid item xs={12}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom>
                Content Performance
              </Typography>
              <Typography>
                Most viewed video: "Video Title" - 10K views
              </Typography>
              <Typography>Average watch time: 5:45 minutes</Typography>
              <Typography>Engagement rate: 8.5%</Typography>
            </StyledPaper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default DashboardPage;
