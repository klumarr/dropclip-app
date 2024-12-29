import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  Grid,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { fetchUserAttributes } from "aws-amplify/auth";
import type { UserAttributes } from "../types/auth.types";

export const ProfilePage = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userAttributes, setUserAttributes] = useState<UserAttributes | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<UserAttributes>>({});
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(true);

  useEffect(() => {
    const loadUserAttributes = async () => {
      if (!user) return;
      try {
        const attributes = await fetchUserAttributes();
        const parsedAttributes: UserAttributes = {
          sub: attributes.sub || "",
          email: attributes.email || "",
          email_verified: attributes.email_verified === "true",
          name: attributes.name,
          picture: attributes.picture,
        };
        setUserAttributes(parsedAttributes);
        setFormData({
          name: parsedAttributes.name || "",
          email: parsedAttributes.email,
        });
      } catch (error) {
        console.error("Failed to fetch user attributes:", error);
      } finally {
        setIsLoadingAttributes(false);
      }
    };

    loadUserAttributes();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const updateData: Record<string, string> = {};
      if (formData.name) {
        updateData.name = formData.name;
      }

      await updateProfile(updateData);
      const attributes = await fetchUserAttributes();
      const parsedAttributes: UserAttributes = {
        sub: attributes.sub || "",
        email: attributes.email || "",
        email_verified: attributes.email_verified === "true",
        name: attributes.name,
        picture: attributes.picture,
      };
      setUserAttributes(parsedAttributes);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading || isLoadingAttributes) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !userAttributes) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error">
          Please log in to view your profile
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} display="flex" justifyContent="center">
            <Avatar
              src={userAttributes.picture}
              alt={userAttributes.name || "User"}
              sx={{ width: 100, height: 100 }}
            />
          </Grid>

          <Grid item xs={12}>
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={formData.email}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" gap={2} justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button variant="contained" type="submit">
                        Save Changes
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">
                    Name: {userAttributes.name || "Not set"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">
                    Email: {userAttributes.email}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ProfilePage;
