import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { playlistOperations } from "../services/playlist.service";
import { PlaylistItem } from "../config/dynamodb";

const PlaylistsPage = () => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<PlaylistItem | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: false,
  });

  useEffect(() => {
    if (user) {
      loadPlaylists();
    }
  }, [user]);

  const loadPlaylists = async () => {
    if (!user?.id) return;
    const userPlaylists = await playlistOperations.listUserPlaylists(user.id);
    setPlaylists(userPlaylists);
  };

  const handleOpenDialog = (playlist?: PlaylistItem) => {
    if (playlist) {
      setEditingPlaylist(playlist);
      setFormData({
        name: playlist.name,
        description: playlist.description || "",
        isPublic: playlist.isPublic,
      });
    } else {
      setEditingPlaylist(null);
      setFormData({
        name: "",
        description: "",
        isPublic: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPlaylist(null);
    setFormData({
      name: "",
      description: "",
      isPublic: false,
    });
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    try {
      if (editingPlaylist) {
        await playlistOperations.updatePlaylist(editingPlaylist.id, {
          name: formData.name,
          description: formData.description,
          isPublic: formData.isPublic,
        });
      } else {
        await playlistOperations.createPlaylist(
          user.id,
          formData.name,
          formData.description,
          formData.isPublic
        );
      }
      await loadPlaylists();
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to save playlist:", error);
    }
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    try {
      await playlistOperations.deletePlaylist(playlistId);
      await loadPlaylists();
    } catch (error) {
      console.error("Failed to delete playlist:", error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" component="h1">
          My Playlists
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Playlist
        </Button>
      </Box>

      <Grid container spacing={3}>
        {playlists.map((playlist) => (
          <Grid item xs={12} sm={6} md={4} key={playlist.id}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={playlist.thumbnailUrl || "/default-playlist.jpg"}
                alt={playlist.name}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {playlist.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {playlist.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {playlist.uploadIds.length} videos
                </Typography>
                <Box display="flex" justifyContent="flex-end" mt={1}>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(playlist)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeletePlaylist(playlist.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton size="small">
                    <PlayArrowIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingPlaylist ? "Edit Playlist" : "Create New Playlist"}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            margin="normal"
            multiline
            rows={3}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.isPublic}
                onChange={(e) =>
                  setFormData({ ...formData, isPublic: e.target.checked })
                }
              />
            }
            label="Make playlist public"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPlaylist ? "Save Changes" : "Create Playlist"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PlaylistsPage;
