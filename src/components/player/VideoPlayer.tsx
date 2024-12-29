import {
  Box,
  IconButton,
  Slider,
  Typography,
  Paper,
  styled,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  VolumeUp,
  VolumeOff,
  QueueMusic,
  Fullscreen,
  FullscreenExit,
  Close,
} from "@mui/icons-material";
import { useState, useRef, useEffect } from "react";

const PlayerContainer = styled(Paper)(({ theme }) => ({
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: "rgba(24, 24, 24, 0.98)",
  backdropFilter: "blur(10px)",
  borderTop: `1px solid ${theme.palette.divider}`,
  display: "flex",
  alignItems: "center",
  zIndex: theme.zIndex.appBar + 1,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  cursor: "pointer",
  [theme.breakpoints.down("md")]: {
    bottom: 56, // Height of mobile navigation
  },
}));

const VideoThumbnail = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "& video": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
}));

const ExpandedVideoContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  backgroundColor: "#000",
  aspectRatio: "16/9",
  maxHeight: "70vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  "& video": {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
}));

const Controls = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(2),
  background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));

const ProgressSlider = styled(Slider)(({ theme }) => ({
  color: theme.palette.primary.main,
  height: 4,
  padding: 0,
  "& .MuiSlider-thumb": {
    width: 8,
    height: 8,
    transition: "0.3s cubic-bezier(.47,1.64,.41,.8)",
    "&:hover, &.Mui-focusVisible": {
      boxShadow: "none",
    },
    "&.Mui-active": {
      width: 12,
      height: 12,
    },
  },
  "& .MuiSlider-rail": {
    opacity: 0.28,
  },
}));

const VolumeSlider = styled(Slider)(({ theme }) => ({
  color: theme.palette.primary.main,
  width: 100,
  "& .MuiSlider-thumb": {
    width: 12,
    height: 12,
  },
}));

interface VideoPlayerProps {
  open: boolean;
  onClose: () => void;
  currentVideo: {
    isPlaying: boolean;
    title: string;
    creator: string;
    thumbnailUrl: string;
    currentTime: number;
    duration: number;
    progress: number;
  };
  onPlayPause: () => void;
  onProgress: (progress: number) => void;
  onTimeUpdate: (currentTime: number) => void;
}

export const VideoPlayer = ({
  open,
  onClose,
  currentVideo,
  onPlayPause,
  onProgress,
  onTimeUpdate,
}: VideoPlayerProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (currentVideo.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      onPlayPause();
    }
  };

  const handleProgress = (newValue: number) => {
    if (videoRef.current) {
      const time = (newValue / 100) * currentVideo.duration;
      videoRef.current.currentTime = time;
      onProgress(newValue);
    }
  };

  const handleVolumeChange = (newValue: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newValue;
      setVolume(newValue);
      setMuted(newValue === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (muted) {
        videoRef.current.volume = volume;
        setMuted(false);
      } else {
        videoRef.current.volume = 0;
        setMuted(true);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      onPlayPause();
    }
    onClose();
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchStartY.current) return;

    const currentY = e.touches[0].clientY;
    const diff = touchStartY.current - currentY;

    // If swiping up (diff > 0) and the distance is significant
    if (diff > 50 && !isExpanded) {
      touchStartY.current = null;
      setIsExpanded(true);
    }
    // If swiping down (diff < 0) and the distance is significant
    else if (diff < -50 && isExpanded) {
      touchStartY.current = null;
      setIsExpanded(false);
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Only expand if clicking the container itself, not buttons
    if (
      e.target === e.currentTarget ||
      (e.target as HTMLElement).closest(".click-through")
    ) {
      setIsExpanded(!isExpanded);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const timeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100;
      onTimeUpdate(video.currentTime);
    };

    const durationChange = () => {
      onTimeUpdate(video.duration);
    };

    video.addEventListener("timeupdate", timeUpdate);
    video.addEventListener("durationchange", durationChange);

    return () => {
      video.removeEventListener("timeupdate", timeUpdate);
      video.removeEventListener("durationchange", durationChange);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener(
        "touchstart",
        handleTouchStart as EventListener
      );
      container.addEventListener("touchmove", handleTouchMove as EventListener);
      container.addEventListener("touchend", handleTouchEnd as EventListener);

      return () => {
        container.removeEventListener(
          "touchstart",
          handleTouchStart as EventListener
        );
        container.removeEventListener(
          "touchmove",
          handleTouchMove as EventListener
        );
        container.removeEventListener(
          "touchend",
          handleTouchEnd as EventListener
        );
      };
    }
  }, [isExpanded]);

  if (!open) return null;

  return (
    <PlayerContainer
      ref={containerRef}
      onClick={handleContainerClick}
      sx={{
        height: isExpanded ? "100vh" : "64px",
        padding: isExpanded ? 0 : "0 16px",
        flexDirection: isExpanded ? "column" : "row",
        gap: isExpanded ? 0 : 2,
        transform: `translateY(${isExpanded ? 0 : "0"})`,
      }}
    >
      {isExpanded ? (
        <>
          <ExpandedVideoContainer>
            <video ref={videoRef} />
            <Controls>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="h6" noWrap>
                  {currentVideo?.title || "Video Title"}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" noWrap>
                  {currentVideo?.creator || "Creator Name"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="caption">
                  {formatTime(
                    currentVideo.duration * (currentVideo.progress / 100)
                  )}
                </Typography>
                <ProgressSlider
                  value={currentVideo.progress}
                  onChange={(_, value) => handleProgress(value as number)}
                />
                <Typography variant="caption">
                  {formatTime(currentVideo.duration)}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton onClick={() => {}} size="small">
                    <SkipPrevious />
                  </IconButton>
                  <IconButton onClick={handlePlayPause} size="large">
                    {currentVideo.isPlaying ? (
                      <Pause sx={{ fontSize: 38 }} />
                    ) : (
                      <PlayArrow sx={{ fontSize: 38 }} />
                    )}
                  </IconButton>
                  <IconButton onClick={() => {}} size="small">
                    <SkipNext />
                  </IconButton>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <IconButton onClick={toggleMute} size="small">
                    {muted ? <VolumeOff /> : <VolumeUp />}
                  </IconButton>
                  <VolumeSlider
                    value={muted ? 0 : volume}
                    onChange={(_, value) => handleVolumeChange(value as number)}
                    min={0}
                    max={1}
                    step={0.1}
                    sx={{ width: 100 }}
                  />
                  <IconButton onClick={toggleFullscreen} size="small">
                    {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                  </IconButton>
                </Box>
              </Box>
            </Controls>
          </ExpandedVideoContainer>
        </>
      ) : (
        <>
          <VideoThumbnail sx={{ width: 48, height: 48 }}>
            <video ref={videoRef} />
          </VideoThumbnail>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minWidth: 0,
            }}
          >
            <Typography variant="subtitle1" noWrap>
              {currentVideo?.title || "Video Title"}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {currentVideo?.creator || "Creator Name"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={handlePlayPause} size="small">
              {currentVideo.isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
            <IconButton onClick={() => {}} size="small">
              <SkipNext />
            </IconButton>
            <IconButton onClick={handleClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </>
      )}
    </PlayerContainer>
  );
};
