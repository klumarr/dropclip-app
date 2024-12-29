import React from "react";
import {
  Paper,
  Box,
  IconButton,
  Typography,
  styled,
  useTheme,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  Favorite,
  FavoriteBorder,
  SkipNext,
  Fullscreen,
} from "@mui/icons-material";

const PlayerContainer = styled(Paper)(({ theme }) => ({
  position: "fixed",
  bottom: 60,
  left: 0,
  right: 0,
  height: 64,
  backgroundColor: "rgba(0, 0, 0, 0.85)",
  backdropFilter: "blur(10px)",
  borderTop: `1px solid ${theme.palette.divider}`,
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 2),
  zIndex: theme.zIndex.appBar - 1,
  cursor: "pointer",
  transition: "background-color 0.2s",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.95)",
  },
}));

interface MiniPlayerProps {
  onExpand: () => void;
  isPlaying?: boolean;
  currentTime?: number;
  duration?: number;
  title?: string;
  creator?: string;
  thumbnailUrl?: string;
  isLiked?: boolean;
  onPlayPause?: () => void;
  onNext?: () => void;
  onLikeToggle?: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  onExpand,
  isPlaying = false,
  currentTime = 0,
  duration = 0,
  title = "No video playing",
  creator = "",
  thumbnailUrl,
  isLiked = false,
  onPlayPause,
  onNext,
  onLikeToggle,
}) => {
  const theme = useTheme();

  const handleClick = (e: React.MouseEvent) => {
    // Don't expand if clicking on control buttons
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    onExpand();
  };

  return (
    <PlayerContainer elevation={3} onClick={handleClick}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </Box>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" noWrap>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {creator}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onLikeToggle?.();
            }}
          >
            {isLiked ? <Favorite color="primary" /> : <FavoriteBorder />}
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onPlayPause?.();
            }}
          >
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onNext?.();
            }}
          >
            <SkipNext />
          </IconButton>
        </Box>
      </Box>
    </PlayerContainer>
  );
};
