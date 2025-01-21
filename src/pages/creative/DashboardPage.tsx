import React, { Suspense } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  VideoLibrary,
  Event,
  Collections,
  Analytics,
} from "@mui/icons-material";
import { ErrorBoundary } from "../../components/common/ErrorBoundary";
import { LoadingState } from "../../components/common/LoadingState";

const DashboardContent: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { userAttributes } = useAuth();

  const quickActions = [
    {
      title: "My Videos",
      description: "Manage your video content",
      icon: VideoLibrary,
      path: "/creative/videos",
    },
    {
      title: "Events",
      description: "Create and manage events",
      icon: Event,
      path: "/creative/events",
    },
    {
      title: "Memory Manager",
      description: "Manage fan-submitted content",
      icon: Collections,
      path: "/creative/memories",
    },
    {
      title: "Analytics",
      description: "View your performance metrics",
      icon: Analytics,
      path: "/creative/analytics",
    },
  ];

  return (
    <Box
      sx={{
        p: 3,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        mt: { xs: 2, sm: 3 }, // Add margin top to prevent header overlap
      }}
    >
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
                  transform: "translateY(-4px)",
                  transition: "all 0.2s ease-in-out",
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
          Recent Videos
        </Typography>
        {/* Add recent videos component here */}
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Upcoming Events
        </Typography>
        {/* Add upcoming events component here */}
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Analytics Overview
        </Typography>
        {/* Add analytics overview component here */}
      </Box>
    </Box>
  );
};

const DashboardPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState message="Loading dashboard..." />}>
        <DashboardContent />
      </Suspense>
    </ErrorBoundary>
  );
};

export default DashboardPage;
