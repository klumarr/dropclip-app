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
  Grid,
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  newFollower: boolean;
  newComment: boolean;
  videoProcessed: boolean;
  weeklyStats: boolean;
}

interface PrivacySettings {
  profileVisibility: boolean;
  showEmail: boolean;
  allowMessages: boolean;
}

const SettingsPage: React.FC = () => {
  const { userAttributes, updateUserAttributes } = useAuth();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: userAttributes?.name || "",
    bio: userAttributes?.bio || "",
    website: userAttributes?.website || "",
    location: userAttributes?.location || "",
  });

  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      emailNotifications: true,
      pushNotifications: true,
      newFollower: true,
      newComment: true,
      videoProcessed: true,
      weeklyStats: true,
    });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: true,
    showEmail: false,
    allowMessages: true,
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handlePrivacyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPrivacySettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setError("");
      setLoading(true);
      const attributes: Record<string, string> = {
        name: profileData.name,
        "custom:bio": profileData.bio,
        "custom:website": profileData.website,
        "custom:location": profileData.location,
      };
      await updateUserAttributes(attributes);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile. Please try again.");
      console.error("Update profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setError("");
      setLoading(true);
      // Implement settings update functionality
      console.log("Notification settings:", notificationSettings);
      console.log("Privacy settings:", privacySettings);
      setSuccess("Settings updated successfully!");
    } catch (err) {
      setError("Failed to update settings. Please try again.");
      console.error("Update settings error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                />
                <TextField
                  fullWidth
                  label="Bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleProfileChange}
                  multiline
                  rows={3}
                />
                <TextField
                  fullWidth
                  label="Website"
                  name="website"
                  value={profileData.website}
                  onChange={handleProfileChange}
                />
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={profileData.location}
                  onChange={handleProfileChange}
                />
                <Button
                  variant="contained"
                  onClick={handleSaveProfile}
                  disabled={loading}
                >
                  Save Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Settings
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onChange={handleNotificationChange}
                      name="emailNotifications"
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onChange={handleNotificationChange}
                      name="pushNotifications"
                    />
                  }
                  label="Push Notifications"
                />
                <Divider sx={{ my: 1 }} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.newFollower}
                      onChange={handleNotificationChange}
                      name="newFollower"
                    />
                  }
                  label="New Follower"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.newComment}
                      onChange={handleNotificationChange}
                      name="newComment"
                    />
                  }
                  label="New Comment"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.videoProcessed}
                      onChange={handleNotificationChange}
                      name="videoProcessed"
                    />
                  }
                  label="Video Processed"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.weeklyStats}
                      onChange={handleNotificationChange}
                      name="weeklyStats"
                    />
                  }
                  label="Weekly Stats"
                />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Privacy Settings
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={privacySettings.profileVisibility}
                      onChange={handlePrivacyChange}
                      name="profileVisibility"
                    />
                  }
                  label="Public Profile"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={privacySettings.showEmail}
                      onChange={handlePrivacyChange}
                      name="showEmail"
                    />
                  }
                  label="Show Email"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={privacySettings.allowMessages}
                      onChange={handlePrivacyChange}
                      name="allowMessages"
                    />
                  }
                  label="Allow Messages"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          onClick={handleSaveSettings}
          disabled={loading}
        >
          Save All Settings
        </Button>
      </Box>
    </Box>
  );
};

export default SettingsPage;
