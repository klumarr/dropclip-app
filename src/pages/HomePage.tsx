import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { fetchUserAttributes } from "aws-amplify/auth";
import {
  UserAttributes,
  TransformedUserAttributes,
  transformUserAttributes,
  UserType,
} from "../types/auth.types";

// Type guard to validate user attributes
const isValidUserAttributes = (
  attributes: Record<string, any>
): attributes is UserAttributes => {
  return (
    typeof attributes.sub === "string" &&
    typeof attributes.email === "string" &&
    typeof attributes.email_verified === "boolean"
  );
};

export const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transformedAttributes, setTransformedAttributes] =
    useState<TransformedUserAttributes | null>(null);

  useEffect(() => {
    const loadUserAttributes = async () => {
      try {
        const attrs = await fetchUserAttributes();
        if (isValidUserAttributes(attrs)) {
          setTransformedAttributes(transformUserAttributes(attrs));
        }
      } catch (error) {
        console.error("Error loading user attributes:", error);
      }
    };

    if (user) {
      loadUserAttributes();
    }
  }, [user]);

  const quickActions = [
    {
      title: "Discover Videos",
      description: "Explore trending videos and find new content creators",
      action: () => navigate("/discover"),
    },
    {
      title: "Create Playlist",
      description: "Organize your favorite videos into custom playlists",
      action: () => navigate("/playlists/create"),
    },
    {
      title: "Upcoming Events",
      description: "Check out upcoming live events and performances",
      action: () => navigate("/events"),
    },
  ];

  if (!transformedAttributes) return <CircularProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4 }}>
        Welcome back
        {transformedAttributes.name ? `, ${transformedAttributes.name}` : ""}
      </Typography>

      <Grid container spacing={4}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                transition: "transform 0.2s, background-color 0.2s",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <Typography variant="h5" component="h3" gutterBottom>
                {action.title}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3, flexGrow: 1 }}
              >
                {action.description}
              </Typography>
              <Button variant="contained" onClick={action.action} fullWidth>
                Get Started
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {transformedAttributes.userType === UserType.CREATIVE && (
        <Box sx={{ mt: 6, textAlign: "center" }}>
          <Typography variant="h5" component="h3" gutterBottom>
            Creative Tools
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Access your creative dashboard to manage your content and engage
            with your audience.
          </Typography>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate("/dashboard")}
            sx={{ mt: 2 }}
          >
            Go to Dashboard
          </Button>
        </Box>
      )}
    </Box>
  );
};
