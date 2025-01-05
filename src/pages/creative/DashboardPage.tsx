import React from "react";
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
  CloudDownload,
  Analytics,
} from "@mui/icons-material";

const DashboardPage: React.FC = () => {
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
      title: "Downloads",
      description: "Access your downloaded content",
      icon: CloudDownload,
      path: "/creative/downloads",
    },
    {
      title: "Analytics",
      description: "View your performance metrics",
      icon: Analytics,
      path: "/creative/analytics",
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

export default DashboardPage;
