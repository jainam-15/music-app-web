import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const backendClient = axios.create({
  baseURL: BACKEND_URL,
});

export const UserAPI = {
  sync: async (user: any) => {
    const res = await backendClient.post('/users/sync', user);
    return res.data;
  },
  likeSong: async (userId: string, song: any) => {
    const res = await backendClient.post('/users/like', { userId, song });
    return res.data;
  },
  getLikedSongs: async (userId: string) => {
    const res = await backendClient.get(`/users/liked/${userId}`);
    return res.data;
  },

  // --- Playlist API ---
  createPlaylist: async (userId: string, name: string) => {
    const res = await backendClient.post('/users/playlists', { userId, name });
    return res.data;
  },
  deletePlaylist: async (userId: string, playlistId: string) => {
    const res = await backendClient.post('/users/playlists/delete', { userId, playlistId });
    return res.data;
  },
  getPlaylists: async (userId: string) => {
    const res = await backendClient.get(`/users/playlists/${userId}`);
    return res.data;
  },
  addToPlaylist: async (userId: string, playlistId: string, song: any) => {
    const res = await backendClient.post('/users/playlists/add', { userId, playlistId, song });
    return res.data;
  },
  removeFromPlaylist: async (userId: string, playlistId: string, songId: string) => {
    const res = await backendClient.post('/users/playlists/remove', { userId, playlistId, songId });
    return res.data;
  },

  updateLastPlayed: async (userId: string, song: any) => {
    const res = await backendClient.post('/users/last-played', { userId, song });
    return res.data;
  },
  getRecentPlays: async (userId: string) => {
    const res = await backendClient.get(`/users/last-played/${userId}`);
    return res.data;
  },
  clearRecentPlays: async (userId: string) => {
    const res = await backendClient.post('/users/clear-recent-plays', { userId });
    return res.data;
  }
};
