import React from "react";
import { useVideoPlayer } from "../../contexts/VideoPlayerContext";
import { MiniPlayer } from "./MiniPlayer";
import { VideoPlayer } from "./VideoPlayer";

export const VideoPlayerContainer: React.FC = () => {
  const {
    isOpen,
    isExpanded,
    currentVideo,
    closePlayer,
    expandPlayer,
    collapsePlayer,
    togglePlayPause,
    updateProgress,
    updateTime,
  } = useVideoPlayer();

  if (!isOpen || !currentVideo) return null;

  return (
    <>
      {isExpanded ? (
        <VideoPlayer
          open={isExpanded}
          onClose={collapsePlayer}
          currentVideo={currentVideo}
          onPlayPause={togglePlayPause}
          onProgress={updateProgress}
          onTimeUpdate={updateTime}
        />
      ) : (
        <MiniPlayer
          open={isOpen}
          onClose={closePlayer}
          currentVideo={currentVideo}
          onPlayPause={togglePlayPause}
          onExpand={expandPlayer}
        />
      )}
    </>
  );
};
