import { Grid } from '@mui/material';
import type { FC } from 'react';

interface Playlist {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoCount: number;
}

interface PlaylistGridProps {
  playlists: Playlist[];
  onPlaylistClick: (playlistId: string) => void;
}

export const PlaylistGrid: FC<PlaylistGridProps> = ({ playlists, onPlaylistClick }) => {
  return (
    <Grid container spacing={2}>
      {playlists.map((playlist) => (
        <Grid key={playlist.id} item xs={12} sm={6} md={4} lg={3}>
          {/* Playlist card implementation will go here */}
          <div onClick={() => onPlaylistClick(playlist.id)}>
            {playlist.title}
          </div>
        </Grid>
      ))}
    </Grid>
  );
};

export default PlaylistGrid;
