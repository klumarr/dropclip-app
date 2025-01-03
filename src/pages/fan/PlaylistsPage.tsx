import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  MoreVert,
  Add,
  Edit,
  Delete,
  VideoLibrary,
  PlaylistPlay,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface Playlist {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoCount: number;
  totalDuration: string;
  lastUpdated: string;
}

const PlaylistsPage = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({
    title: "",
    description: "",
  });

  // Mock data - replace with actual data from API
  const playlists: Playlist[] = [
    {
      id: "1",
      title: "Favorite Performances",
      description: "A collection of my favorite performances",
      thumbnailUrl: "https://via.placeholder.com/320x180",
      videoCount: 12,
      totalDuration: "2h 45m",
      lastUpdated: "2023-12-01",
    },
    // Add more mock playlists here
  ];

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    playlistId: string
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedPlaylist(playlistId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPlaylist(null);
  };

  const handleCreateDialogOpen = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateDialogClose = () => {
    setIsCreateDialogOpen(false);
    setNewPlaylist({ title: "", description: "" });
  };

  const handleCreatePlaylist = () => {
    // Implement create playlist functionality
    console.log("Create playlist:", newPlaylist);
    handleCreateDialogClose();
  };

  const handleEdit = () => {
    if (selectedPlaylist) {
      navigate(`/fan/playlists/edit/${selectedPlaylist}`);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedPlaylist) {
      // Implement delete functionality
      console.log("Delete playlist:", selectedPlaylist);
    }
    handleMenuClose();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          My Playlists
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleCreateDialogOpen}
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
                height={180}
                image={playlist.thumbnailUrl}
                alt={playlist.title}
                sx={{ cursor: "pointer" }}
                onClick={() => navigate(`/fan/playlists/${playlist.id}`)}
              />
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                    {playlist.title}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, playlist.id)}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    mb: 2,
                  }}
                >
                  {playlist.description}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <VideoLibrary
                      sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {playlist.videoCount} videos
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <PlaylistPlay
                      sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {playlist.totalDuration}
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 1 }}
                >
                  Last updated on{" "}
                  {new Date(playlist.lastUpdated).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      <Dialog
        open={isCreateDialogOpen}
        onClose={handleCreateDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Playlist</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Title"
              value={newPlaylist.title}
              onChange={(e) =>
                setNewPlaylist((prev) => ({ ...prev, title: e.target.value }))
              }
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={newPlaylist.description}
              onChange={(e) =>
                setNewPlaylist((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              multiline
              rows={4}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose}>Cancel</Button>
          <Button
            onClick={handleCreatePlaylist}
            variant="contained"
            disabled={!newPlaylist.title}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {playlists.length === 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
            textAlign: "center",
          }}
        >
          <VideoLibrary sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No playlists yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Create your first playlist to organize your favorite videos
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleCreateDialogOpen}
          >
            Create Playlist
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PlaylistsPage;
