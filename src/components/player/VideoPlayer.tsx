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
  padding: theme.spacing(1, 2),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  zIndex: theme.zIndex.appBar + 1,
  [theme.breakpoints.down("md")]: {
    bottom: 56, // Height of mobile navigation
  },
}));

const VideoThumbnail = styled(Box)(({ theme }) => ({
  width: 56,
  height: 56,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  "& video": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
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
}

export const VideoPlayer = ({ open, onClose }: VideoPlayerProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const handleProgress = (newValue: number) => {
    if (videoRef.current) {
      const time = (newValue / 100) * duration;
      videoRef.current.currentTime = time;
      setProgress(newValue);
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
      setPlaying(false);
    }
    onClose();
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const timeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
    };

    const durationChange = () => {
      setDuration(video.duration);
    };

    video.addEventListener("timeupdate", timeUpdate);
    video.addEventListener("durationchange", durationChange);

    return () => {
      video.removeEventListener("timeupdate", timeUpdate);
      video.removeEventListener("durationchange", durationChange);
    };
  }, []);

  if (!open) return null;

  return (
    <PlayerContainer>
      <VideoThumbnail>
        <video ref={videoRef} />
      </VideoThumbnail>

      <Box sx={{ display: "flex", flexDirection: "column", flex: 1, gap: 0.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="subtitle1" noWrap>
              Video Title
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              Creator Name
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            <Close />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="caption">
            {formatTime(duration * (progress / 100))}
          </Typography>
          <ProgressSlider
            value={progress}
            onChange={(_, value) => handleProgress(value as number)}
          />
          <Typography variant="caption">{formatTime(duration)}</Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton onClick={() => {}} size="small">
          <SkipPrevious />
        </IconButton>
        <IconButton onClick={handlePlayPause} size="small">
          {playing ? <Pause /> : <PlayArrow />}
        </IconButton>
        <IconButton onClick={() => {}} size="small">
          <SkipNext />
        </IconButton>
      </Box>

      {!isMobile && (
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 150 }}
        >
          <IconButton onClick={toggleMute} size="small">
            {muted ? <VolumeOff /> : <VolumeUp />}
          </IconButton>
          <VolumeSlider
            value={muted ? 0 : volume}
            onChange={(_, value) => handleVolumeChange(value as number)}
            min={0}
            max={1}
            step={0.1}
          />
        </Box>
      )}

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton onClick={() => {}} size="small">
          <QueueMusic />
        </IconButton>
        <IconButton onClick={toggleFullscreen} size="small">
          {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
        </IconButton>
      </Box>
    </PlayerContainer>
  );
};
