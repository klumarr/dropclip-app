import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { ThumbUp, Share, ContentCut } from "@mui/icons-material";
import { useState, useEffect } from "react";

// Analytics utility function (to be implemented)
const trackVideoEngagement = (videoId: string) => {
  // Implementation will be added when analytics service is set up
  console.log("Tracking engagement for video:", videoId);
};

interface Comment {
  id: string;
  text: string;
  user: {
    name: string;
    avatar: string;
  };
  timestamp: Date;
}

interface Reaction {
  count: number;
  userReacted: boolean;
}

interface VideoSocialFeaturesProps {
  videoId: string;
  comments: Comment[];
  reactions: {
    likes: Reaction;
  };
  onAddComment: (text: string) => Promise<void>;
  onReact: () => Promise<void>;
  onShare: (timestamp?: number) => Promise<void>;
  onCreateClip: (start: number, end: number) => Promise<void>;
}

export const VideoSocialFeatures = ({
  videoId,
  comments,
  reactions,
  onAddComment,
  onReact,
  onShare,
  onCreateClip,
}: VideoSocialFeaturesProps) => {
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track video engagement
  useEffect(() => {
    trackVideoEngagement(videoId);
  }, [videoId]);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onAddComment(commentText);
      setCommentText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReact = async () => {
    try {
      await onReact();
    } catch (err) {
      console.error("Error reacting to video:", err);
    }
  };

  const handleShare = async (timestamp?: number) => {
    try {
      await onShare(timestamp);
    } catch (err) {
      console.error("Error sharing video:", err);
    }
  };

  const handleCreateClip = async (start: number, end: number) => {
    try {
      await onCreateClip(start, end);
    } catch (err) {
      console.error("Error creating clip:", err);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <IconButton
          onClick={handleReact}
          aria-label={`Like video ${videoId}`}
          color={reactions.likes.userReacted ? "primary" : "default"}
        >
          <ThumbUp />
          <Typography variant="caption" sx={{ ml: 1 }}>
            {reactions.likes.count}
          </Typography>
        </IconButton>
        <IconButton
          onClick={() => handleShare()}
          aria-label={`Share video ${videoId}`}
        >
          <Share />
        </IconButton>
        <IconButton
          onClick={() => handleCreateClip(0, 0)}
          aria-label={`Create clip from video ${videoId}`}
        >
          <ContentCut />
        </IconButton>
      </Box>

      <Typography variant="h6" gutterBottom>
        Comments ({comments.length})
      </Typography>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={isSubmitting}
          error={!!error}
          helperText={error}
          sx={{ mb: 1 }}
        />
        <Button
          variant="contained"
          onClick={handleAddComment}
          disabled={isSubmitting || !commentText.trim()}
        >
          {isSubmitting ? "Posting..." : "Post Comment"}
        </Button>
      </Box>

      <List>
        {comments.map((comment) => (
          <ListItem key={comment.id} alignItems="flex-start">
            <ListItemAvatar>
              <Avatar src={comment.user.avatar} alt={comment.user.name} />
            </ListItemAvatar>
            <ListItemText
              primary={comment.user.name}
              secondary={
                <>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.primary"
                  >
                    {comment.text}
                  </Typography>
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                  >
                    {comment.timestamp.toLocaleString()}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
