export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
  cover?: string;
  genre?: string;
  album?: string;
}

export interface Playlist {
  id: string;
  name: string;
  userId: string;
  songs: Song[];
  isPublic: boolean;
}

export const API_BASE_URL = "http://localhost:3000";
export const SOCKET_URL = "http://localhost:3001";
