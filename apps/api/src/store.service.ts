import { Injectable } from '@nestjs/common';

@Injectable()
export class StoreService {
  private users: Map<string, any> = new Map();
  private likedSongs: Map<string, any[]> = new Map();
  private recentPlays: Map<string, any[]> = new Map();
  private playlists: Map<string, any[]> = new Map(); // userId -> Playlist[]

  constructor() {
    console.log('✓ In-memory Store initialized (No MongoDB required for demo)');
  }

  async syncUser(userData: any) {
    this.users.set(userData.uid, userData);
    if (!this.likedSongs.has(userData.uid)) {
      this.likedSongs.set(userData.uid, []);
    }
    if (!this.playlists.has(userData.uid)) {
      this.playlists.set(userData.uid, []);
    }
    if (!this.recentPlays.has(userData.uid)) {
      this.recentPlays.set(userData.uid, []);
    }
    return userData;
  }

  // --- Liked Songs ---
  async likeSong(userId: string, song: any) {
    const list = this.likedSongs.get(userId) || [];
    const exists = list.find(s => s.id === song.id);
    if (exists) {
      this.likedSongs.set(userId, list.filter(s => s.id !== song.id));
    } else {
      this.likedSongs.set(userId, [song, ...list]);
    }
    return this.likedSongs.get(userId);
  }

  async getLiked(userId: string) {
    return this.likedSongs.get(userId) || [];
  }

  // --- Playlists ---
  async createPlaylist(userId: string, name: string) {
    const userPlaylists = this.playlists.get(userId) || [];
    const newPlaylist = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      songs: [],
      createdAt: new Date(),
    };
    this.playlists.set(userId, [...userPlaylists, newPlaylist]);
    return newPlaylist;
  }

  async getPlaylists(userId: string) {
    return this.playlists.get(userId) || [];
  }

  async addToPlaylist(userId: string, playlistId: string, song: any) {
    const userPlaylists = this.playlists.get(userId) || [];
    const playlist = userPlaylists.find(p => p.id === playlistId);
    if (playlist && !playlist.songs.find(s => s.id === song.id)) {
      playlist.songs.push(song);
    }
    return playlist;
  }

  async removeFromPlaylist(userId: string, playlistId: string, songId: string) {
    const userPlaylists = this.playlists.get(userId) || [];
    const playlist = userPlaylists.find(p => p.id === playlistId);
    if (playlist) {
      playlist.songs = playlist.songs.filter(s => s.id !== songId);
    }
    return playlist;
  }

  async setLastPlayed(userId: string, song: any) {
    const list = this.recentPlays.get(userId) || [];
    const filtered = list.filter(s => s.id !== song.id);
    this.recentPlays.set(userId, [song, ...filtered].slice(0, 20));
    return song;
  }

  async getRecentPlays(userId: string) {
    return this.recentPlays.get(userId) || [];
  }
}
