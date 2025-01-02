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
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  MoreVert,
  Add,
  Edit,
  Delete,
  Share,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  views: number;
  isPublic: boolean;
  createdAt: string;
}

const VideosPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Mock data - replace with actual data from API
  const videos: Video[] = [
    {
      id: "1",
      title: "Performance Highlights",
      description: "Best moments from my recent performance",
      thumbnailUrl: "https://via.placeholder.com/320x180",
      duration: "5:30",
      views: 1234,
      isPublic: true,
      createdAt: "2023-12-01",
    },
    // Add more mock videos here
  ];

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    videoId: string
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedVideo(videoId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedVideo(null);
  };

  const handleEdit = () => {
    if (selectedVideo) {
      navigate(`/creative/videos/edit/${selectedVideo}`);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedVideo) {
      // Implement delete functionality
      console.log("Delete video:", selectedVideo);
    }
    handleMenuClose();
  };

  const handleShare = () => {
    if (selectedVideo) {
      // Implement share functionality
      console.log("Share video:", selectedVideo);
    }
    handleMenuClose();
  };

  const handleToggleVisibility = () => {
    if (selectedVideo) {
      // Implement visibility toggle functionality
      console.log("Toggle visibility for video:", selectedVideo);
    }
    handleMenuClose();
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          My Videos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => navigate("/creative/videos/upload")}
        >
          Upload Video
        </Button>
      </Box>

      <Grid container spacing={3}>
        {videos.map((video) => (
          <Grid item xs={12} sm={6} md={4} key={video.id}>
            <Card>
              <Box sx={{ position: "relative" }}>
                <CardMedia
                  component="img"
                  height={180}
                  image={video.thumbnailUrl}
                  alt={video.title}
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/creative/videos/${video.id}`)}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    bgcolor: "rgba(0, 0, 0, 0.8)",
                    color: "white",
                    px: 1,
                    borderRadius: 1,
                    fontSize: "0.875rem",
                  }}
                >
                  {video.duration}
                </Box>
              </Box>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{ flex: 1, pr: 2 }}>
                    <Typography variant="h6" noWrap>
                      {video.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {video.description}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, video.id)}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {formatViews(video.views)}
                  </Typography>
                  <Chip
                    label={video.isPublic ? "Public" : "Private"}
                    size="small"
                    color={video.isPublic ? "success" : "default"}
                  />
                </Box>
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
        <MenuItem onClick={handleShare}>
          <Share sx={{ mr: 1 }} /> Share
        </MenuItem>
        <MenuItem onClick={handleToggleVisibility}>
          {videos.find((v) => v.id === selectedVideo)?.isPublic ? (
            <>
              <VisibilityOff sx={{ mr: 1 }} /> Make Private
            </>
          ) : (
            <>
              <Visibility sx={{ mr: 1 }} /> Make Public
            </>
          )}
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {videos.length === 0 && (
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
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No videos uploaded yet
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => navigate("/creative/videos/upload")}
          >
            Upload Your First Video
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default VideosPage;
