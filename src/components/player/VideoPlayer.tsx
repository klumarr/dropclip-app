import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, IconButton, Typography, Slider, styled } from "@mui/material";
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  FullscreenExit,
  Close,
  SkipNext,
  SkipPrevious,
} from "@mui/icons-material";

const PlayerContainer = styled(Box)(({ theme }) => ({
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: "rgba(24, 24, 24, 0.98)",
  backdropFilter: "blur(10px)",
  display: "flex",
  alignItems: "center",
  zIndex: theme.zIndex.appBar + 1,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  transform: "translate3d(0, 0, 0)",
  willChange: "transform, height, bottom, left, right, border-radius",
  "&.collapsing": {
    bottom: theme.spacing(2),
    left: theme.spacing(2),
    right: theme.spacing(2),
    height: 64,
    borderRadius: theme.spacing(2),
    backgroundColor: "rgba(24, 24, 24, 0.95)",
  },
  [theme.breakpoints.down("md")]: {
    bottom: 56, // Height of mobile navigation
    "&.collapsing": {
      bottom: theme.spacing(9),
    },
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

const ExpandedVideoContainer = styled(Box)(() => ({
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isVerticalSwipe, setIsVerticalSwipe] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);

  const handleClose = useCallback(() => {
    setIsCollapsing(true);
    // Add a small delay to allow the animation to complete
    setTimeout(() => {
      setIsCollapsing(false);
      onClose();
    }, 300);
  }, [onClose]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && !isDragging) {
      onTimeUpdate?.(videoRef.current.currentTime);
    }
  }, [isDragging, onTimeUpdate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [handleTimeUpdate]);

  useEffect(() => {
    const handleDocumentTouchMove = (e: TouchEvent) => {
      if (touchStartY === 0) return;

      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = currentY - touchStartY;
      const deltaX = currentX - touchStartX;

      // Determine if this is a vertical swipe
      if (!isVerticalSwipe && Math.abs(deltaY) > Math.abs(deltaX)) {
        setIsVerticalSwipe(true);
      }

      // If swiping down and the distance is significant
      if (isVerticalSwipe && deltaY > 50) {
        handleClose();
      }
    };

    if (isDragging) {
      document.addEventListener("touchmove", handleDocumentTouchMove, {
        passive: true,
      });
      return () => {
        document.removeEventListener("touchmove", handleDocumentTouchMove);
      };
    }
  }, [isDragging, touchStartX, touchStartY, isVerticalSwipe, handleClose]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      setTouchStartY(e.touches[0].clientY);
      setTouchStartX(e.touches[0].clientX);
      setIsVerticalSwipe(false);
      setIsDragging(true);
    },
    []
  );

  const handleTouchEnd = useCallback(() => {
    setTouchStartY(0);
    setTouchStartX(0);
    setIsDragging(false);
  }, []);

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
      setIsMuted(newValue === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
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

  if (!open) return null;

  return (
    <PlayerContainer
      ref={progressBarRef}
      className={isCollapsing ? "collapsing" : ""}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      sx={{
        height: isFullscreen ? "100vh" : "100%",
        padding: isFullscreen ? 0 : "0 16px",
        flexDirection: isFullscreen ? "column" : "row",
        gap: isFullscreen ? 0 : 2,
      }}
    >
      {isFullscreen ? (
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
                    {isMuted ? <VolumeOff /> : <VolumeUp />}
                  </IconButton>
                  <VolumeSlider
                    value={isMuted ? 0 : volume}
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
