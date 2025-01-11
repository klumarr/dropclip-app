import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  Star as StarIcon,
} from "@mui/icons-material";

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
}

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  likes: number;
  comments: Comment[];
  shares: number;
}

interface FanEngagementProps {
  creativeId: string;
  videos: Video[];
  onLike: (videoId: string) => Promise<void>;
  onComment: (videoId: string, comment: string) => Promise<void>;
  onShare: (videoId: string) => Promise<void>;
  onFollow: () => Promise<void>;
  isFollowing: boolean;
}

export const FanEngagement: React.FC<FanEngagementProps> = ({
  creativeId,
  videos,
  onLike,
  onComment,
  onShare,
  onFollow,
  isFollowing,
}) => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Track engagement metrics for analytics
  const logEngagement = async (
    action: "like" | "comment" | "share",
    videoId: string
  ) => {
    try {
      // You would typically call an analytics service here
      console.log(
        `Engagement tracked - Creative: ${creativeId}, Video: ${videoId}, Action: ${action}`
      );
    } catch (error) {
      console.error("Error logging engagement:", error);
    }
  };

  const handleLike = async (videoId: string) => {
    try {
      await onLike(videoId);
      await logEngagement("like", videoId);
    } catch (error) {
      console.error("Error liking video:", error);
    }
  };

  const handleComment = async () => {
    if (selectedVideo && newComment.trim()) {
      try {
        await onComment(selectedVideo.id, newComment);
        await logEngagement("comment", selectedVideo.id);
        setNewComment("");
        setCommentDialogOpen(false);
      } catch (error) {
        console.error("Error posting comment:", error);
      }
    }
  };

  const handleShare = async (videoId: string) => {
    try {
      await onShare(videoId);
      await logEngagement("share", videoId);
      setShareDialogOpen(false);
    } catch (error) {
      console.error("Error sharing video:", error);
    }
  };

  const handleFollow = async () => {
    try {
      await onFollow();
    } catch (error) {
      console.error("Error following creative:", error);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">Fan Engagement</Typography>
        <Button
          variant={isFollowing ? "outlined" : "contained"}
          onClick={handleFollow}
          startIcon={<StarIcon />}
        >
          {isFollowing ? "Following" : "Follow"}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {videos.map((video) => (
          <Grid item xs={12} sm={6} md={4} key={video.id}>
            <Card>
              <CardContent>
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  style={{
                    width: "100%",
                    aspectRatio: "16/9",
                    objectFit: "cover",
                  }}
                />
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  {video.title}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <IconButton onClick={() => handleLike(video.id)}>
                    <Badge badgeContent={video.likes} color="primary">
                      <FavoriteIcon color="action" />
                    </Badge>
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setSelectedVideo(video);
                      setCommentDialogOpen(true);
                    }}
                  >
                    <Badge badgeContent={video.comments.length} color="primary">
                      <CommentIcon color="action" />
                    </Badge>
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setSelectedVideo(video);
                      setShareDialogOpen(true);
                    }}
                  >
                    <Badge badgeContent={video.shares} color="primary">
                      <ShareIcon color="action" />
                    </Badge>
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Comment Dialog */}
      <Dialog
        open={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Comments</DialogTitle>
        <DialogContent>
          <List>
            {selectedVideo?.comments.map((comment) => (
              <ListItem key={comment.id}>
                <ListItemAvatar>
                  <Avatar src={comment.userAvatar} alt={comment.userName} />
                </ListItemAvatar>
                <ListItemText
                  primary={comment.userName}
                  secondary={comment.content}
                />
              </ListItem>
            ))}
          </List>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleComment} variant="contained">
            Post Comment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share Video</DialogTitle>
        <DialogContent>
          <List>
            <ListItem
              button
              onClick={() => selectedVideo && handleShare(selectedVideo.id)}
            >
              <ListItemAvatar>
                <Avatar>
                  <ShareIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Share to Social Media" />
            </ListItem>
            <ListItem
              button
              onClick={() => {
                if (selectedVideo) {
                  navigator.clipboard.writeText(
                    `https://yourapp.com/videos/${selectedVideo.id}`
                  );
                  setShareDialogOpen(false);
                }
              }}
            >
              <ListItemAvatar>
                <Avatar>
                  <ShareIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Copy Link" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
