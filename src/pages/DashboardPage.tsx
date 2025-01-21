import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getAuthorizedNavItems } from "../config/navigation.config";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { userAttributes } = useAuth();

  const navigationItems = getAuthorizedNavItems(
    userAttributes?.userType,
    "dashboard"
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome back{userAttributes?.name ? `, ${userAttributes.name}` : ""}
      </Typography>

      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Quick Actions
      </Typography>

      <Grid container spacing={3}>
        {navigationItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <item.icon />
                  <Typography variant="h6">{item.label}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {/* Add descriptions based on the navigation item */}
                  {item.id === "events" &&
                    "Manage your events and generate upload links"}
                  {item.id === "downloads" &&
                    "Download and manage fan-submitted videos"}
                  {item.id === "playlists" &&
                    "Organize and showcase your videos"}
                  {item.id === "settings" && "Manage your account settings"}
                  {item.id === "search" && "Discover new content and creators"}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() =>
                    navigate(
                      typeof item.path === "function"
                        ? item.path(userAttributes?.id)
                        : item.path
                    )
                  }
                  startIcon={<item.icon />}
                >
                  Go to {item.label}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
