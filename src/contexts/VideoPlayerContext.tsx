import React, { createContext, useContext, useState, useCallback } from "react";

interface VideoState {
  isPlaying: boolean;
  title: string;
  creator: string;
  thumbnailUrl: string;
  currentTime: number;
  duration: number;
  progress: number;
  url: string;
}

interface VideoPlayerContextType {
  isOpen: boolean;
  isExpanded: boolean;
  currentVideo: VideoState | null;
  openPlayer: (video: VideoState) => void;
  closePlayer: () => void;
  expandPlayer: () => void;
  collapsePlayer: () => void;
  togglePlayPause: () => void;
  updateProgress: (progress: number) => void;
  updateTime: (currentTime: number) => void;
  playVideo: (video: {
    url: string;
    title: string;
    thumbnailUrl?: string;
  }) => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextType | undefined>(
  undefined
);

export const VideoPlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<VideoState | null>(null);

  const openPlayer = useCallback((video: VideoState) => {
    setCurrentVideo(video);
    setIsOpen(true);
  }, []);

  const closePlayer = useCallback(() => {
    setIsOpen(false);
    setIsExpanded(false);
    setCurrentVideo(null);
  }, []);

  const expandPlayer = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const collapsePlayer = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (currentVideo) {
      setCurrentVideo((prev) => ({
        ...prev!,
        isPlaying: !prev!.isPlaying,
      }));
    }
  }, [currentVideo]);

  const updateProgress = useCallback(
    (progress: number) => {
      if (currentVideo) {
        setCurrentVideo((prev) => ({
          ...prev!,
          progress,
        }));
      }
    },
    [currentVideo]
  );

  const updateTime = useCallback(
    (currentTime: number) => {
      if (currentVideo) {
        setCurrentVideo((prev) => ({
          ...prev!,
          currentTime,
        }));
      }
    },
    [currentVideo]
  );

  const playVideo = useCallback(
    (video: { url: string; title: string; thumbnailUrl?: string }) => {
      const newVideo: VideoState = {
        url: video.url,
        title: video.title,
        creator: "Unknown", // You might want to pass this as a parameter
        thumbnailUrl: video.thumbnailUrl || "",
        isPlaying: true,
        currentTime: 0,
        duration: 0,
        progress: 0,
      };
      openPlayer(newVideo);
      expandPlayer();
    },
    [openPlayer, expandPlayer]
  );

  const value = {
    isOpen,
    isExpanded,
    currentVideo,
    openPlayer,
    closePlayer,
    expandPlayer,
    collapsePlayer,
    togglePlayPause,
    updateProgress,
    updateTime,
    playVideo,
  };

  return (
    <VideoPlayerContext.Provider value={value}>
      {children}
    </VideoPlayerContext.Provider>
  );
};

export const useVideoPlayer = () => {
  const context = useContext(VideoPlayerContext);
  if (context === undefined) {
    throw new Error("useVideoPlayer must be used within a VideoPlayerProvider");
  }
  return context;
};
