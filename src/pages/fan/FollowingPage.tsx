import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Avatar,
  useTheme,
  useMediaQuery,
  Tab,
  Tabs,
} from "@mui/material";
import { Person, VideoLibrary, Event, Favorite } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface Creator {
  id: string;
  name: string;
  avatarUrl: string;
  coverUrl: string;
  bio: string;
  followers: number;
  videos: number;
  isFollowing: boolean;
}

interface Update {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  type: "video" | "event";
  title: string;
  description: string;
  thumbnailUrl: string;
  date: string;
}

const FollowingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("creators");

  // Mock data - replace with actual data from API
  const creators: Creator[] = [
    {
      id: "1",
      name: "John Doe",
      avatarUrl: "https://via.placeholder.com/100x100",
      coverUrl: "https://via.placeholder.com/800x200",
      bio: "Professional musician and performer",
      followers: 12000,
      videos: 45,
      isFollowing: true,
    },
    // Add more mock creators here
  ];

  const updates: Update[] = [
    {
      id: "1",
      creatorId: "1",
      creatorName: "John Doe",
      creatorAvatar: "https://via.placeholder.com/40x40",
      type: "video",
      title: "New Performance Video",
      description: "Check out my latest performance!",
      thumbnailUrl: "https://via.placeholder.com/320x180",
      date: "2023-12-01",
    },
    // Add more mock updates here
  ];

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const handleToggleFollow = (creatorId: string) => {
    // Implement follow/unfollow functionality
    console.log("Toggle follow:", creatorId);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Following
      </Typography>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ mb: 3 }}
        variant={isMobile ? "scrollable" : "standard"}
        scrollButtons={isMobile ? "auto" : false}
      >
        <Tab
          icon={<Person />}
          iconPosition="start"
          label="Creators"
          value="creators"
        />
        <Tab
          icon={<Favorite />}
          iconPosition="start"
          label="Updates"
          value="updates"
        />
      </Tabs>

      {activeTab === "creators" && (
        <Grid container spacing={3}>
          {creators.map((creator) => (
            <Grid item xs={12} sm={6} md={4} key={creator.id}>
              <Card>
                <CardMedia
                  component="img"
                  height={120}
                  image={creator.coverUrl}
                  alt={creator.name}
                />
                <CardContent sx={{ position: "relative", pt: 6 }}>
                  <Avatar
                    src={creator.avatarUrl}
                    alt={creator.name}
                    sx={{
                      width: 80,
                      height: 80,
                      position: "absolute",
                      top: -40,
                      left: "50%",
                      transform: "translateX(-50%)",
                      border: "4px solid white",
                    }}
                  />
                  <Typography variant="h6" align="center" gutterBottom>
                    {creator.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={{
                      mb: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {creator.bio}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 3,
                      mb: 2,
                    }}
                  >
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h6">
                        {formatNumber(creator.followers)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Followers
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h6">
                        {formatNumber(creator.videos)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Videos
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant={creator.isFollowing ? "outlined" : "contained"}
                      fullWidth
                      onClick={() => handleToggleFollow(creator.id)}
                    >
                      {creator.isFollowing ? "Following" : "Follow"}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/fan/creators/${creator.id}`)}
                    >
                      View Profile
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === "updates" && (
        <Grid container spacing={3}>
          {updates.map((update) => (
            <Grid item xs={12} sm={6} md={4} key={update.id}>
              <Card>
                <CardMedia
                  component="img"
                  height={180}
                  image={update.thumbnailUrl}
                  alt={update.title}
                  sx={{ cursor: "pointer" }}
                  onClick={() => {
                    const path =
                      update.type === "video"
                        ? `/fan/videos/${update.id}`
                        : `/fan/events/${update.id}`;
                    navigate(path);
                  }}
                />
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      src={update.creatorAvatar}
                      alt={update.creatorName}
                      sx={{ width: 32, height: 32, mr: 1 }}
                    />
                    <Typography variant="subtitle1">
                      {update.creatorName}
                    </Typography>
                  </Box>

                  <Typography variant="h6" gutterBottom>
                    {update.title}
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
                      mb: 1,
                    }}
                  >
                    {update.description}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {update.type === "video" ? (
                      <VideoLibrary
                        sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }}
                      />
                    ) : (
                      <Event
                        sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }}
                      />
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {new Date(update.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {((activeTab === "creators" && creators.length === 0) ||
        (activeTab === "updates" && updates.length === 0)) && (
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
          {activeTab === "creators" ? (
            <Person sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          ) : (
            <Favorite sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          )}
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {activeTab === "creators"
              ? "Not following any creators yet"
              : "No updates from creators"}
          </Typography>
          {activeTab === "creators" && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/fan/search")}
            >
              Discover Creators
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default FollowingPage;
