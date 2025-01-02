import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";

const SettingsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { userAttributes, updateProfile, error, clearError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [profileData, setProfileData] = useState({
    name: userAttributes?.name || "",
    bio: "",
    emailNotifications: true,
    autoPlay: true,
    darkMode: false,
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();
    setSuccessMessage("");

    try {
      await updateProfile({
        name: profileData.name,
        "custom:bio": profileData.bio,
        "custom:emailNotifications": profileData.emailNotifications.toString(),
        "custom:autoPlay": profileData.autoPlay.toString(),
        "custom:darkMode": profileData.darkMode.toString(),
      });
      setSuccessMessage("Profile updated successfully");
    } catch (error) {
      console.error("Profile update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value, checked } = e.target as HTMLInputElement;
    setProfileData((prev) => ({
      ...prev,
      [name]: checked !== undefined ? checked : value,
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {error && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>
              <Box
                component="form"
                onSubmit={handleProfileUpdate}
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <TextField
                  label="Name"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                />

                <TextField
                  label="Bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  fullWidth
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preferences
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      name="emailNotifications"
                      checked={profileData.emailNotifications}
                      onChange={handleChange}
                    />
                  }
                  label="Email Notifications"
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 3 }}
                >
                  Receive email notifications about new content from creators
                  you follow
                </Typography>

                <Divider />

                <FormControlLabel
                  control={
                    <Switch
                      name="autoPlay"
                      checked={profileData.autoPlay}
                      onChange={handleChange}
                    />
                  }
                  label="Auto-Play Videos"
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 3 }}
                >
                  Automatically play videos when scrolling through your feed
                </Typography>

                <Divider />

                <FormControlLabel
                  control={
                    <Switch
                      name="darkMode"
                      checked={profileData.darkMode}
                      onChange={handleChange}
                    />
                  }
                  label="Dark Mode"
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 3 }}
                >
                  Switch between light and dark theme
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Security
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    // Implement change password functionality
                    console.log("Change password clicked");
                  }}
                >
                  Change Password
                </Button>

                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    // Implement two-factor authentication setup
                    console.log("Setup 2FA clicked");
                  }}
                >
                  Setup Two-Factor Authentication
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;
