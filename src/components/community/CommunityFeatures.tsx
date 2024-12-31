import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Divider,
  Badge,
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  Send as SendIcon,
} from "@mui/icons-material";

interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
}

interface Post {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  shares: number;
}

interface CommunityFeaturesProps {
  posts: Post[];
  currentUserId: string;
  onLikePost: (postId: string) => Promise<void>;
  onCommentPost: (postId: string, content: string) => Promise<void>;
  onSharePost: (postId: string) => Promise<void>;
}

export const CommunityFeatures: React.FC<CommunityFeaturesProps> = ({
  posts,
  currentUserId,
  onLikePost,
  onCommentPost,
  onSharePost,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [commentContent, setCommentContent] = useState("");

  const handleCommentClick = (post: Post) => {
    setSelectedPost(post);
    setCommentDialogOpen(true);
  };

  const handleShareClick = (post: Post) => {
    setSelectedPost(post);
    setShareDialogOpen(true);
  };

  const handleSubmitComment = async () => {
    if (selectedPost && commentContent.trim()) {
      await onCommentPost(selectedPost.id, commentContent);
      setCommentContent("");
      setCommentDialogOpen(false);
    }
  };

  const handleShare = async () => {
    if (selectedPost) {
      await onSharePost(selectedPost.id);
      setShareDialogOpen(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Latest Posts" />
        <Tab label="Popular" />
        <Tab label="Following" />
      </Tabs>

      <List>
        {posts.map((post) => (
          <React.Fragment key={post.id}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <ListItem disableGutters>
                  <ListItemAvatar>
                    <Avatar src={post.avatar} alt={post.username} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={post.username}
                    secondary={post.timestamp}
                  />
                </ListItem>
                <Typography variant="body1" sx={{ my: 2 }}>
                  {post.content}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <IconButton onClick={() => onLikePost(post.id)}>
                      {post.likes > 0 ? (
                        <Badge badgeContent={post.likes} color="primary">
                          <FavoriteIcon color="primary" />
                        </Badge>
                      ) : (
                        <FavoriteBorderIcon />
                      )}
                    </IconButton>
                    <IconButton onClick={() => handleCommentClick(post)}>
                      <Badge
                        badgeContent={post.comments.length}
                        color="primary"
                      >
                        <CommentIcon />
                      </Badge>
                    </IconButton>
                    <IconButton onClick={() => handleShareClick(post)}>
                      <Badge badgeContent={post.shares} color="primary">
                        <ShareIcon />
                      </Badge>
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </React.Fragment>
        ))}
      </List>

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
            {selectedPost?.comments.map((comment) => (
              <React.Fragment key={comment.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar src={comment.avatar} alt={comment.username} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={comment.username}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          {comment.content}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          sx={{ display: "block" }}
                        >
                          {comment.timestamp}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
          <Box sx={{ display: "flex", mt: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Write a comment..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
            />
            <IconButton
              color="primary"
              onClick={handleSubmitComment}
              disabled={!commentContent.trim()}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Share Post</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Share this post with your followers?
          </Typography>
          {selectedPost && (
            <Card variant="outlined" sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="body2">{selectedPost.content}</Typography>
                <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                  Originally posted by {selectedPost.username}
                </Typography>
              </CardContent>
            </Card>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleShare}>
            Share
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
