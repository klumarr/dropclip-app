export interface User {
  id: string;
  email: string;
  username?: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Video {
  id: number | string;
  title: string;
  url: string;
  duration?: number;
  thumbnail?: string;
  description?: string;
  uploadDate?: Date;
  userId?: string;
  creator?: string;
}

export interface Event {
  id: string;
  title: string;
  date: Date;
  location: string;
  description: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  videos: Video[];
}
