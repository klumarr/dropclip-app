import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Chip,
  useTheme,
  InputAdornment,
} from "@mui/material";
import { Search, PlayArrow } from "@mui/icons-material";
import { useVideoPlayer } from "../contexts/VideoPlayerContext";

const mockVideos = [
  {
    id: 1,
    title: "Summer Vibes Mix",
    creator: "DJ Summer",
    thumbnailUrl: "https://example.com/thumbnail1.jpg",
    duration: "5:23",
    views: "1.2K",
    tags: ["Music", "Summer", "Mix"],
  },
  {
    id: 2,
    title: "Beach Sunset Session",
    creator: "Nature Vibes",
    thumbnailUrl: "https://example.com/thumbnail2.jpg",
    duration: "3:45",
    views: "856",
    tags: ["Nature", "Relaxation"],
  },
  // Add more mock videos as needed
];

export const SearchPage = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const { openPlayer } = useVideoPlayer();

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handlePlayVideo = (video: (typeof mockVideos)[0]) => {
    openPlayer({
      isPlaying: true,
      title: video.title,
      creator: video.creator,
      thumbnailUrl: video.thumbnailUrl,
      currentTime: 0,
      duration: 180, // Mock duration in seconds
      progress: 0,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Search
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search for videos, creators, or playlists"
        value={searchQuery}
        onChange={handleSearch}
        sx={{ mb: 4 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={3}>
        {mockVideos.map((video) => (
          <Grid item xs={12} sm={6} md={4} key={video.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                bgcolor: "background.paper",
                borderRadius: 2,
              }}
            >
              <Box sx={{ position: "relative" }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={video.thumbnailUrl}
                  alt={video.title}
                  sx={{ bgcolor: "grey.800" }} // Placeholder color
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    bgcolor: "rgba(0, 0, 0, 0.7)",
                    color: "white",
                    padding: "2px 4px",
                    borderRadius: 1,
                    fontSize: "0.75rem",
                  }}
                >
                  {video.duration}
                </Box>
                <IconButton
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "rgba(0, 0, 0, 0.5)",
                    "&:hover": {
                      bgcolor: "rgba(0, 0, 0, 0.7)",
                    },
                  }}
                  onClick={() => handlePlayVideo(video)}
                >
                  <PlayArrow sx={{ color: "white" }} />
                </IconButton>
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {video.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {video.creator} • {video.views} views
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {video.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
