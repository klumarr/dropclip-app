import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from "@mui/material";
import {
  Edit as EditIcon,
  Add as AddIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  YouTube as YouTubeIcon,
} from "@mui/icons-material";
import { CreativeType } from "../../types/auth.types";

interface SocialLink {
  platform: string;
  url: string;
}

interface CreativeProfileProps {
  name: string;
  email: string;
  creativeType: CreativeType;
  customCreativeType?: string;
  bio?: string;
  avatar?: string;
  socialLinks?: SocialLink[];
  upcomingEvents?: number;
  totalFans?: number;
  totalVideos?: number;
  onUpdateProfile: (data: any) => Promise<void>;
}

export const CreativeProfile: React.FC<CreativeProfileProps> = ({
  name,
  email,
  creativeType,
  customCreativeType,
  bio = "",
  avatar = "",
  socialLinks = [],
  upcomingEvents = 0,
  totalFans = 0,
  totalVideos = 0,
  onUpdateProfile,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState(bio);
  const [editedSocialLinks, setEditedSocialLinks] = useState(socialLinks);
  const [isAddingSocialLink, setIsAddingSocialLink] = useState(false);
  const [newSocialLink, setNewSocialLink] = useState({ platform: "", url: "" });

  const handleSave = async () => {
    await onUpdateProfile({
      bio: editedBio,
      socialLinks: editedSocialLinks,
    });
    setIsEditing(false);
  };

  const handleAddSocialLink = () => {
    if (newSocialLink.platform && newSocialLink.url) {
      setEditedSocialLinks([...editedSocialLinks, newSocialLink]);
      setNewSocialLink({ platform: "", url: "" });
      setIsAddingSocialLink(false);
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <InstagramIcon />;
      case "twitter":
        return <TwitterIcon />;
      case "facebook":
        return <FacebookIcon />;
      case "youtube":
        return <YouTubeIcon />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Card elevation={3}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
            <Avatar src={avatar} sx={{ width: 100, height: 100, mr: 3 }} />
            <Box>
              <Typography variant="h4">{name}</Typography>
              <Typography variant="body1" color="text.secondary">
                {creativeType === CreativeType.OTHER
                  ? customCreativeType
                  : creativeType}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {email}
              </Typography>
            </Box>
            <IconButton sx={{ ml: "auto" }} onClick={() => setIsEditing(true)}>
              <EditIcon />
            </IconButton>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={4}>
              <Typography variant="h6" align="center">
                {upcomingEvents}
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary">
                Upcoming Events
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h6" align="center">
                {totalFans}
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary">
                Fans
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h6" align="center">
                {totalVideos}
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary">
                Videos
              </Typography>
            </Grid>
          </Grid>

          {isEditing ? (
            <TextField
              fullWidth
              multiline
              rows={4}
              value={editedBio}
              onChange={(e) => setEditedBio(e.target.value)}
              label="Bio"
              variant="outlined"
              sx={{ mb: 3 }}
            />
          ) : (
            <Typography variant="body1" paragraph>
              {bio || "No bio available"}
            </Typography>
          )}

          <Typography variant="h6" sx={{ mb: 2 }}>
            Social Links
            {isEditing && (
              <IconButton
                size="small"
                onClick={() => setIsAddingSocialLink(true)}
                sx={{ ml: 1 }}
              >
                <AddIcon />
              </IconButton>
            )}
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {editedSocialLinks.map((link, index) => (
              <Chip
                key={index}
                icon={getSocialIcon(link.platform)}
                label={link.platform}
                component="a"
                href={link.url}
                target="_blank"
                clickable
                onDelete={
                  isEditing
                    ? () => {
                        setEditedSocialLinks(
                          editedSocialLinks.filter((_, i) => i !== index)
                        );
                      }
                    : undefined
                }
              />
            ))}
          </Box>

          {isEditing && (
            <Box
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
              }}
            >
              <Button variant="outlined" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSave}>
                Save Changes
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isAddingSocialLink}
        onClose={() => setIsAddingSocialLink(false)}
      >
        <DialogTitle>Add Social Link</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Platform"
            value={newSocialLink.platform}
            onChange={(e) =>
              setNewSocialLink({ ...newSocialLink, platform: e.target.value })
            }
            sx={{ mb: 2, mt: 1 }}
            SelectProps={{
              native: true,
            }}
          >
            <option value="">Select Platform</option>
            <option value="Instagram">Instagram</option>
            <option value="Twitter">Twitter</option>
            <option value="Facebook">Facebook</option>
            <option value="YouTube">YouTube</option>
          </TextField>
          <TextField
            fullWidth
            label="URL"
            value={newSocialLink.url}
            onChange={(e) =>
              setNewSocialLink({ ...newSocialLink, url: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddingSocialLink(false)}>Cancel</Button>
          <Button onClick={handleAddSocialLink} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
