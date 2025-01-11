import { Grid } from '@mui/material';
import type { FC } from 'react';

interface Video {
  id: string;
  title: string;
  creator: string;
  thumbnail: string;
  duration: number;
}

interface VideoGridProps {
  videos: Video[];
  onVideoClick: (videoId: string) => void;
}

export const VideoGrid: FC<VideoGridProps> = ({ videos, onVideoClick }) => {
  return (
    <Grid container spacing={2}>
      {videos.map((video) => (
        <Grid key={video.id} item xs={12} sm={6} md={4} lg={3}>
          {/* Video card implementation will go here */}
          <div onClick={() => onVideoClick(video.id)}>
            {video.title}
          </div>
        </Grid>
      ))}
    </Grid>
  );
};

export default VideoGrid;
