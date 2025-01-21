import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Avatar,
  Paper,
  IconButton,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import { PhotoCamera, Delete as DeleteIcon } from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { styled } from "@mui/material/styles";
import { SocialLinks } from "../../types/auth.types";
import { userService } from "../../services/user.service";
import { validateSocialLinks } from "../../utils/validation";
import { profileImageService } from "../../services/profile-image.service";

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(15),
  height: theme.spacing(15),
  margin: "0 auto",
  marginBottom: theme.spacing(2),
  position: "relative",
}));

const UploadButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  width: 32,
  height: 32,
  padding: 0,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
  "& .MuiCircularProgress-root": {
    color: theme.palette.primary.contrastText,
  },
}));

const DeleteButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  bottom: theme.spacing(1),
  left: theme.spacing(1),
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.error.dark,
  },
}));

interface FormData {
  displayName: string;
  creativeType: string;
  bio: string;
  socialLinks: SocialLinks;
  avatarUrl?: string;
  bookingAgent?: {
    name: string;
    email: string;
    phone?: string;
  };
  management?: {
    name: string;
    email: string;
    phone?: string;
  };
}

const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userId } = useParams();
  const [formData, setFormData] = useState<FormData>({
    displayName: user?.displayName || "",
    creativeType: user?.creativeType || "",
    bio: user?.bio || "",
    avatarUrl: user?.avatarUrl || "",
    socialLinks: user?.socialLinks || {
      instagram: "",
      twitter: "",
      tiktok: "",
      website: "",
    },
    bookingAgent: {
      name: user?.bookingAgent?.name || "",
      email: user?.bookingAgent?.email || "",
      phone: user?.bookingAgent?.phone || "",
    },
    management: {
      name: user?.management?.name || "",
      email: user?.management?.email || "",
      phone: user?.management?.phone || "",
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socialLinkErrors, setSocialLinkErrors] = useState<
    Partial<Record<keyof SocialLinks, string>>
  >({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    console.log("🖱️ Upload button clicked");
    fileInputRef.current?.click();
  };

  // Redirect if not the profile owner
  useEffect(() => {
    if (user?.id !== userId) {
      navigate(`/profile/${userId}`);
    }
  }, [user, userId, navigate]);

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    setIsUploading(true);
    setError(null);

    try {
      const imageUrl = await profileImageService.uploadProfileImage(
        user.id,
        file,
        (progress) => {
          const percentage = Math.round(
            (progress.loaded / progress.total) * 100
          );
          setUploadProgress(percentage);
        }
      );

      setFormData((prev) => ({
        ...prev,
        avatarUrl: imageUrl,
      }));

      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);
      setImagePreview(null);
    } catch (error) {
      console.error("Failed to upload profile photo:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to upload profile photo"
      );
      // Clean up preview URL on error
      URL.revokeObjectURL(previewUrl);
      setImagePreview(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    if (name.startsWith("social.")) {
      const socialPlatform = name.split(".")[1] as keyof SocialLinks;
      const newSocialLinks = {
        ...formData.socialLinks,
        [socialPlatform]: value,
      };

      // Validate the new URL
      const { errors } = validateSocialLinks({ [socialPlatform]: value });
      setSocialLinkErrors((prev) => ({
        ...prev,
        [socialPlatform]: errors[socialPlatform],
      }));

      setFormData((prev) => ({
        ...prev,
        socialLinks: newSocialLinks,
      }));
    } else if (name.startsWith("bookingAgent.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        bookingAgent: {
          ...prev.bookingAgent,
          [field]: value,
        },
      }));
    } else if (name.startsWith("management.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        management: {
          ...prev.management,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.id) return;

    // Validate all social links before submission
    const { isValid, errors } = validateSocialLinks(formData.socialLinks);
    setSocialLinkErrors(errors);

    if (!isValid) {
      setError("Please correct the invalid social media URLs");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("📝 EditProfilePage - Submitting profile update:", formData);

      await userService.updateUserProfile({
        id: user.id,
        displayName: formData.displayName,
        bio: formData.bio,
        socialLinks: formData.socialLinks,
        creativeType: formData.creativeType,
        bookingAgent: formData.bookingAgent,
        management: formData.management,
      });

      console.log("✅ EditProfilePage - Profile updated successfully");
      navigate(`/profile/${user.id}`);
    } catch (error) {
      console.error("❌ EditProfilePage - Failed to update profile:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/profile/${userId}`);
  };

  const handleDeletePhoto = async () => {
    if (!user?.id || !formData.avatarUrl) return;

    setIsLoading(true);
    setError(null);

    try {
      await profileImageService.deleteProfileImage(user.id, formData.avatarUrl);
      setFormData((prev) => ({
        ...prev,
        avatarUrl: "",
      }));
      console.log("✅ Profile photo deleted successfully");
    } catch (error) {
      console.error("❌ Failed to delete profile photo:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete profile photo"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Edit Profile
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Box
            position="relative"
            display="inline-block"
            width="100%"
            textAlign="center"
            mb={3}
          >
            <ProfileAvatar
              src={imagePreview || formData.avatarUrl || user?.avatarUrl}
              alt={
                formData.displayName || user?.displayName || "Profile picture"
              }
            >
              {!imagePreview &&
                !formData.avatarUrl &&
                !user?.avatarUrl &&
                (
                  formData.displayName?.[0] ||
                  user?.displayName?.[0] ||
                  ""
                ).toUpperCase()}
            </ProfileAvatar>
            <input
              ref={fileInputRef}
              accept="image/*"
              type="file"
              onChange={handlePhotoUpload}
              style={{ display: "none" }}
              disabled={isUploading || isLoading}
            />
            <IconButton
              onClick={handleUploadClick}
              size="small"
              disabled={isUploading || isLoading}
              title="Upload new photo"
              sx={{
                position: "absolute",
                bottom: "8px",
                right: "8px",
                backgroundColor: (theme) => theme.palette.primary.main,
                color: (theme) => theme.palette.primary.contrastText,
                width: 32,
                height: 32,
                padding: 0,
                "&:hover": {
                  backgroundColor: (theme) => theme.palette.primary.dark,
                },
                "& .MuiCircularProgress-root": {
                  color: (theme) => theme.palette.primary.contrastText,
                },
              }}
            >
              {isUploading ? (
                <CircularProgress
                  size={20}
                  variant="determinate"
                  value={uploadProgress}
                />
              ) : (
                <PhotoCamera fontSize="small" />
              )}
            </IconButton>
            {formData.avatarUrl && (
              <DeleteButton
                size="small"
                onClick={handleDeletePhoto}
                disabled={isUploading || isLoading}
                title="Delete photo"
              >
                <DeleteIcon fontSize="small" />
              </DeleteButton>
            )}
            {isUploading && (
              <Typography variant="caption" display="block" textAlign="center">
                Uploading... {uploadProgress}%
              </Typography>
            )}
          </Box>

          <Stack spacing={3} mt={4}>
            <TextField
              fullWidth
              label="Display Name"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />

            <TextField
              fullWidth
              label="Creative Type"
              name="creativeType"
              value={formData.creativeType}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />

            <TextField
              fullWidth
              label="Bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              multiline
              rows={4}
              disabled={isLoading}
            />

            <Typography variant="h6" gutterBottom>
              Social Links
            </Typography>

            <TextField
              fullWidth
              label="Instagram"
              name="social.instagram"
              value={formData.socialLinks.instagram}
              onChange={handleInputChange}
              disabled={isLoading}
              error={!!socialLinkErrors.instagram}
              helperText={socialLinkErrors.instagram}
            />

            <TextField
              fullWidth
              label="Twitter"
              name="social.twitter"
              value={formData.socialLinks.twitter}
              onChange={handleInputChange}
              disabled={isLoading}
              error={!!socialLinkErrors.twitter}
              helperText={socialLinkErrors.twitter}
            />

            <TextField
              fullWidth
              label="TikTok"
              name="social.tiktok"
              value={formData.socialLinks.tiktok}
              onChange={handleInputChange}
              disabled={isLoading}
              error={!!socialLinkErrors.tiktok}
              helperText={socialLinkErrors.tiktok}
            />

            <TextField
              fullWidth
              label="Website"
              name="social.website"
              value={formData.socialLinks.website}
              onChange={handleInputChange}
              disabled={isLoading}
              error={!!socialLinkErrors.website}
              helperText={socialLinkErrors.website}
            />

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Booking Agent Information
            </Typography>
            <Stack spacing={2}>
              <TextField
                name="bookingAgent.name"
                label="Agent Name"
                value={formData.bookingAgent?.name || ""}
                onChange={handleInputChange}
                fullWidth
                disabled={isLoading}
              />
              <TextField
                name="bookingAgent.email"
                label="Agent Email"
                value={formData.bookingAgent?.email || ""}
                onChange={handleInputChange}
                fullWidth
                disabled={isLoading}
              />
              <TextField
                name="bookingAgent.phone"
                label="Agent Phone"
                value={formData.bookingAgent?.phone || ""}
                onChange={handleInputChange}
                fullWidth
                disabled={isLoading}
              />
            </Stack>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Management Information
            </Typography>
            <Stack spacing={2}>
              <TextField
                name="management.name"
                label="Management Name"
                value={formData.management?.name || ""}
                onChange={handleInputChange}
                fullWidth
                disabled={isLoading}
              />
              <TextField
                name="management.email"
                label="Management Email"
                value={formData.management?.email || ""}
                onChange={handleInputChange}
                fullWidth
                disabled={isLoading}
              />
              <TextField
                name="management.phone"
                label="Management Phone"
                value={formData.management?.phone || ""}
                onChange={handleInputChange}
                fullWidth
                disabled={isLoading}
              />
            </Stack>

            <Box
              sx={{
                mt: 4,
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditProfilePage;
