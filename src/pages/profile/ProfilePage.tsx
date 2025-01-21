import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  Stack,
  styled,
  CircularProgress,
  Alert,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from "@mui/material";
import {
  People as PeopleIcon,
  Event as EventIcon,
  VideoLibrary as VideoIcon,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { userService } from "../../services/user.service";
import { followService } from "../../services/follow.service";
import { eventsService } from "../../services/eventsService";
import { Event } from "../../types/events.types";
import { UpcomingEventsTimeline } from "../../components/events/UpcomingEventsTimeline";
import AuthModal from "../../components/auth/AuthModal";

const ProfileHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  position: "relative",
  backgroundSize: "cover",
  backgroundPosition: "center",
  minHeight: 200,
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(15),
  height: theme.spacing(15),
  border: `4px solid ${theme.palette.background.paper}`,
  marginBottom: theme.spacing(2),
}));

const StatsBox = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(3),
  marginTop: theme.spacing(2),
}));

const StatItem = styled(Box)(({ theme }) => ({
  textAlign: "center",
}));

interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  userType: string;
  bio?: string;
  avatarUrl?: string;
}

interface ProfileData extends Partial<AuthUser> {
  isFollowing?: boolean;
  followerCount?: number;
  eventCount?: number;
  videoCount?: number;
  displayName: string;
  userType: string;
  bio?: string;
  avatarUrl?: string;
}

const ProfilePage: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showUnfollowDialog, setShowUnfollowDialog] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const isOwner = currentUser?.id === userId;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        console.log("ProfilePage - Fetching profile data for:", userId);
        const profile = await userService.getPublicProfile(userId);
        console.log("ProfilePage - Profile data received:", profile);

        if (profile) {
          const transformedProfile: ProfileData = {
            displayName: profile.displayName || profile.name || "Unknown User",
            userType: profile.userType || "FAN",
            bio: profile.bio,
            avatarUrl: profile.avatarUrl || profile.photoURL,
            id: profile.id,
            email: profile.email,
            followerCount: profile.followerCount || 0,
            eventCount: profile.eventCount || 0,
            videoCount: profile.videoCount || 0,
          };
          setProfileData(transformedProfile);
        }

        if (currentUser?.id) {
          console.log("ProfilePage - Checking follow status for:", userId);
          const followStatus = await followService.checkFollowStatus(userId);
          console.log("ProfilePage - Follow status:", followStatus);
          setIsFollowing(followStatus);
        }

        console.log("ProfilePage - Fetching upcoming events for:", userId);
        const events = await eventsService.getUpcomingEventsByCreativeId(
          userId
        );
        console.log("ProfilePage - Upcoming events received:", events);
        setUpcomingEvents(events);
      } catch (error) {
        console.error("ProfilePage - Error fetching profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, currentUser?.id]);

  const handleFollowClick = async () => {
    if (!currentUser) {
      setAuthMessage("Sign in to follow this creative");
      setShowAuthModal(true);
      return;
    }

    if (isFollowing) {
      setShowUnfollowDialog(true);
      return;
    }

    try {
      await followService.followCreative(userId!);
      setIsFollowing(true);
      setNotification({
        message: `You are now following ${profileData?.displayName}`,
        severity: "success",
      });

      // Refresh profile data to update follower count
      const profile = await userService.getPublicProfile(userId!);
      if (profile) {
        const transformedProfile: ProfileData = {
          displayName: profile.displayName || profile.name || "Unknown User",
          userType: profile.userType || "FAN",
          bio: profile.bio,
          avatarUrl: profile.avatarUrl || profile.photoURL,
          id: profile.id,
          email: profile.email,
          followerCount: profile.followerCount || 0,
          eventCount: profile.eventCount || 0,
          videoCount: profile.videoCount || 0,
        };
        setProfileData(transformedProfile);
      }
    } catch (error) {
      console.error("Error following creative:", error);
      setNotification({
        message:
          error instanceof Error
            ? error.message
            : "Failed to follow. Please try again.",
        severity: "error",
      });
    }
  };

  const handleUnfollow = async () => {
    try {
      await followService.unfollowCreative(userId!);
      setIsFollowing(false);
      setShowUnfollowDialog(false);
      setNotification({
        message: `You have unfollowed ${profileData?.displayName}`,
        severity: "success",
      });

      // Refresh profile data to update follower count
      const profile = await userService.getPublicProfile(userId!);
      if (profile) {
        const transformedProfile: ProfileData = {
          displayName: profile.displayName || profile.name || "Unknown User",
          userType: profile.userType || "FAN",
          bio: profile.bio,
          avatarUrl: profile.avatarUrl || profile.photoURL,
          id: profile.id,
          email: profile.email,
          followerCount: profile.followerCount || 0,
          eventCount: profile.eventCount || 0,
          videoCount: profile.videoCount || 0,
        };
        setProfileData(transformedProfile);
      }
    } catch (error) {
      console.error("Error unfollowing creative:", error);
      setNotification({
        message:
          error instanceof Error
            ? error.message
            : "Failed to unfollow. Please try again.",
        severity: "error",
      });
    }
  };

  const handleAuthSuccess = async () => {
    console.log("ProfilePage - Auth success callback triggered");
    setShowAuthModal(false);

    // Wait for auth context to update
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if we have a user now
    if (currentUser) {
      console.log("ProfilePage - User authenticated, attempting follow");
      try {
        await followService.followCreative(userId!);
        setIsFollowing(true);
        setNotification({
          message: `You are now following ${profileData?.displayName}`,
          severity: "success",
        });

        // Refresh profile data to update follower count
        const profile = await userService.getPublicProfile(userId!);
        if (profile) {
          const transformedProfile: ProfileData = {
            displayName: profile.displayName || profile.name || "Unknown User",
            userType: profile.userType || "FAN",
            bio: profile.bio,
            avatarUrl: profile.avatarUrl || profile.photoURL,
            id: profile.id,
            email: profile.email,
            followerCount: profile.followerCount || 0,
            eventCount: profile.eventCount || 0,
            videoCount: profile.videoCount || 0,
          };
          setProfileData(transformedProfile);
        }
      } catch (error) {
        console.error("ProfilePage - Error following after auth:", error);
        setNotification({
          message: "Failed to follow. Please try again.",
          severity: "error",
        });
      }
    } else {
      console.log("ProfilePage - No user found after auth");
      setNotification({
        message: "Please refresh the page and try again",
        severity: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!profileData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Alert severity="error">Profile not found</Alert>
      </Box>
    );
  }

  // Simplified view for unauthenticated users
  if (!currentUser) {
    return (
      <Container maxWidth="lg">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={profileData.avatarUrl}
                  alt={profileData.displayName}
                  sx={{ width: 80, height: 80 }}
                />
                <Box flex={1}>
                  <Typography variant="h4">
                    {profileData.displayName}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {profileData.userType}
                  </Typography>
                  {profileData.bio && (
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {profileData.bio}
                    </Typography>
                  )}
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PersonAddIcon />}
                  onClick={handleFollowClick}
                >
                  Follow
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Upcoming Events
              </Typography>
              {upcomingEvents.length > 0 ? (
                <UpcomingEventsTimeline events={upcomingEvents} />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No upcoming events
                </Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                Join DropClip to See More
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Sign up to follow {profileData.displayName}, save events, and
                get notified about new performances.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowAuthModal(true)}
              >
                Sign Up Now
              </Button>
            </Paper>
          </Grid>
        </Grid>

        <Dialog
          open={showUnfollowDialog}
          onClose={() => setShowUnfollowDialog(false)}
        >
          <DialogTitle>Unfollow Confirmation</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to unfollow {profileData?.displayName}?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowUnfollowDialog(false)}>Cancel</Button>
            <Button onClick={handleUnfollow} color="primary">
              Unfollow
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={!!notification}
          autoHideDuration={6000}
          onClose={() => setNotification(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          {notification && (
            <Alert
              onClose={() => setNotification(null)}
              severity={notification.severity}
              sx={{ width: "100%" }}
            >
              {notification.message}
            </Alert>
          )}
        </Snackbar>

        <AuthModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          message={authMessage}
          onSuccess={handleAuthSuccess}
        />
      </Container>
    );
  }

  // Authenticated user view
  return (
    <Container maxWidth="lg">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                src={profileData.avatarUrl}
                alt={profileData.displayName}
                sx={{ width: 80, height: 80 }}
              />
              <Box flex={1}>
                <Typography variant="h4">{profileData.displayName}</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {profileData.userType}
                </Typography>
                {profileData.bio && (
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {profileData.bio}
                  </Typography>
                )}
              </Box>
              {!isOwner && (
                <Button
                  variant={isFollowing ? "outlined" : "contained"}
                  color="primary"
                  startIcon={isFollowing ? <PersonIcon /> : <PersonAddIcon />}
                  onClick={handleFollowClick}
                  sx={
                    isFollowing
                      ? {
                          "&:hover": {
                            backgroundColor: "error.main",
                            color: "error.contrastText",
                            borderColor: "error.main",
                          },
                        }
                      : {}
                  }
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              )}
              {isOwner && (
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/profile/${userId}/edit`)}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Showcase Videos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Coming soon...
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Stats
            </Typography>
            <StatsBox>
              <StatItem>
                <PeopleIcon color="action" />
                <Typography variant="h6">
                  {profileData.followerCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Followers
                </Typography>
              </StatItem>
              <StatItem>
                <EventIcon color="action" />
                <Typography variant="h6">{profileData.eventCount}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Events
                </Typography>
              </StatItem>
              <StatItem>
                <VideoIcon color="action" />
                <Typography variant="h6">{profileData.videoCount}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Videos
                </Typography>
              </StatItem>
            </StatsBox>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Events
            </Typography>
            <UpcomingEventsTimeline events={upcomingEvents} />
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={showUnfollowDialog}
        onClose={() => setShowUnfollowDialog(false)}
      >
        <DialogTitle>Unfollow Confirmation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to unfollow {profileData?.displayName}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUnfollowDialog(false)}>Cancel</Button>
          <Button onClick={handleUnfollow} color="primary">
            Unfollow
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {notification && (
          <Alert
            onClose={() => setNotification(null)}
            severity={notification.severity}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        )}
      </Snackbar>

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message={authMessage}
        onSuccess={handleAuthSuccess}
      />
    </Container>
  );
};

export default ProfilePage;
