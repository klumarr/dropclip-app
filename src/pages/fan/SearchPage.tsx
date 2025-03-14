import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Chip,
  Tab,
  Tabs,
  Avatar,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Search as SearchIcon,
  Person,
  Event,
  VideoLibrary,
  Favorite,
  FavoriteBorder,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  getPlaceholderImage,
  handleImageError,
  getFallbackImage,
} from "../../utils/image.utils";

interface SearchResult {
  id: string;
  type: "creator" | "video" | "event";
  title: string;
  description: string;
  thumbnailUrl: string;
  creatorName?: string;
  creatorAvatar?: string;
  views?: number;
  likes?: number;
  date?: string;
  isLiked?: boolean;
}

const SearchPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([
    {
      id: "1",
      type: "creator",
      title: "John Doe",
      description: "Electronic music producer and DJ",
      thumbnailUrl: getPlaceholderImage("thumbnail"),
      creatorAvatar: getPlaceholderImage("avatar"),
    },
    {
      id: "2",
      type: "video",
      title: "Live Performance Highlights",
      description: "Best moments from the summer festival",
      thumbnailUrl: getPlaceholderImage("thumbnail"),
      creatorName: "Jane Smith",
      creatorAvatar: getPlaceholderImage("avatar"),
      views: 1234,
      likes: 89,
      isLiked: false,
    },
    {
      id: "3",
      type: "event",
      title: "Music Festival 2024",
      description: "Annual electronic music festival",
      thumbnailUrl: getPlaceholderImage("thumbnail"),
      date: "2024-07-15",
    },
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Search for:", searchQuery);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleLike = (id: string) => {
    setResults((prev) =>
      prev.map((result) =>
        result.id === id
          ? {
              ...result,
              isLiked: !result.isLiked,
              likes: (result.likes || 0) + (result.isLiked ? -1 : 1),
            }
          : result
      )
    );
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const handleAvatarError = (
    e: React.SyntheticEvent<HTMLDivElement, Event>,
    type: "avatar" | "thumbnail" | "cover"
  ): void => {
    const avatarDiv = e.currentTarget;
    const imgElement = avatarDiv.querySelector("img");
    if (imgElement) {
      imgElement.onerror = null;
      imgElement.src = getFallbackImage(type);
    }
  };

  const renderResults = () => {
    const filteredResults = results.filter((result) => {
      switch (activeTab) {
        case 0:
          return true; // All
        case 1:
          return result.type === "creator";
        case 2:
          return result.type === "video";
        case 3:
          return result.type === "event";
        default:
          return false;
      }
    });

    return (
      <Grid container spacing={3}>
        {filteredResults.map((result) => (
          <Grid item xs={12} sm={6} md={4} key={result.id}>
            <Card>
              {result.type === "creator" ? (
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Avatar
                      src={result.creatorAvatar}
                      sx={{ width: 80, height: 80 }}
                      onError={(e) => handleAvatarError(e, "avatar")}
                    />
                    <Box>
                      <Typography variant="h6">{result.title}</Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {result.description}
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate(`/fan/creator/${result.id}`)}
                      >
                        View Profile
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              ) : (
                <>
                  <CardMedia
                    component="img"
                    height={180}
                    image={result.thumbnailUrl}
                    alt={result.title}
                    sx={{ cursor: "pointer" }}
                    onClick={() =>
                      navigate(`/fan/${result.type}s/${result.id}`)
                    }
                    onError={(e) => handleImageError(e, "thumbnail")}
                  />
                  <CardContent>
                    <Typography variant="h6" noWrap>
                      {result.title}
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
                      {result.description}
                    </Typography>
                    {result.type === "video" && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mt: 2,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            src={result.creatorAvatar}
                            sx={{ width: 24, height: 24, mr: 1 }}
                            onError={(e) => handleAvatarError(e, "avatar")}
                          />
                          <Typography variant="body2">
                            {result.creatorName}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography variant="body2" color="text.secondary">
                            {formatNumber(result.views || 0)} views
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleLike(result.id)}
                            sx={{ ml: 1 }}
                          >
                            {result.isLiked ? (
                              <Favorite color="error" />
                            ) : (
                              <FavoriteBorder />
                            )}
                          </IconButton>
                          <Typography variant="body2" color="text.secondary">
                            {formatNumber(result.likes || 0)}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {result.type === "event" && (
                      <Box sx={{ mt: 2 }}>
                        <Chip
                          label={new Date(
                            result.date || ""
                          ).toLocaleDateString()}
                          size="small"
                          color="primary"
                        />
                      </Box>
                    )}
                  </CardContent>
                </>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Discover
      </Typography>

      <Box
        component="form"
        onSubmit={handleSearch}
        sx={{ mb: 4, maxWidth: "600px" }}
      >
        <TextField
          fullWidth
          placeholder="Search for creators, videos, or events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ mb: 3 }}
        variant={isMobile ? "scrollable" : "standard"}
        scrollButtons={isMobile ? "auto" : false}
      >
        <Tab icon={<SearchIcon />} label="All" />
        <Tab icon={<Person />} label="Creators" />
        <Tab icon={<VideoLibrary />} label="Videos" />
        <Tab icon={<Event />} label="Events" />
      </Tabs>

      {renderResults()}
    </Box>
  );
};

export default SearchPage;
