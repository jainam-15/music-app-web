import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StoreService {
  private STORAGE_PATH = path.join(process.cwd(), 'data-store.json');
  private users: Map<string, any> = new Map();
  private likedSongs: Map<string, any[]> = new Map();
  private recentPlays: Map<string, any[]> = new Map();
  private playlists: Map<string, any[]> = new Map();

  constructor() {
    this.loadFromDisk();
    console.log('✓ In-memory Store with Local Persistence initialized');
  }

  private saveToDisk() {
    try {
      const data = {
        users: Object.fromEntries(this.users),
        likedSongs: Object.fromEntries(this.likedSongs),
        recentPlays: Object.fromEntries(this.recentPlays),
        playlists: Object.fromEntries(this.playlists),
      };
      fs.writeFileSync(this.STORAGE_PATH, JSON.stringify(data, null, 2));
    } catch (e) { console.error('Save failed:', e); }
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.STORAGE_PATH)) {
        const data = JSON.parse(fs.readFileSync(this.STORAGE_PATH, 'utf8'));
        this.users = new Map(Object.entries(data.users || {}));
        this.likedSongs = new Map(Object.entries(data.likedSongs || {}));
        this.recentPlays = new Map(Object.entries(data.recentPlays || {}));
        this.playlists = new Map(Object.entries(data.playlists || {}));
      }
    } catch (e) { console.error('Load failed:', e); }
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
    this.saveToDisk();
    return userData;
  }

  async likeSong(userId: string, song: any) {
    const list = this.likedSongs.get(userId) || [];
    const exists = list.find(s => s.id === song.id);
    if (exists) {
      this.likedSongs.set(userId, list.filter(s => s.id !== song.id));
    } else {
      this.likedSongs.set(userId, [song, ...list]);
    }
    this.saveToDisk();
    return this.likedSongs.get(userId);
  }

  async getLiked(userId: string) {
    return this.likedSongs.get(userId) || [];
  }

  async createPlaylist(userId: string, name: string) {
    const userPlaylists = this.playlists.get(userId) || [];
    const newPlaylist = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      songs: [],
      createdAt: new Date(),
    };
    this.playlists.set(userId, [...userPlaylists, newPlaylist]);
    this.saveToDisk();
    return newPlaylist;
  }

  async deletePlaylist(userId: string, playlistId: string) {
    const list = this.playlists.get(userId) || [];
    this.playlists.set(userId, list.filter(p => p.id !== playlistId));
    this.saveToDisk();
    return true;
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
    this.saveToDisk();
    return playlist;
  }

  async removeFromPlaylist(userId: string, playlistId: string, songId: string) {
    const userPlaylists = this.playlists.get(userId) || [];
    const playlist = userPlaylists.find(p => p.id === playlistId);
    if (playlist) {
      playlist.songs = playlist.songs.filter(s => s.id !== songId);
    }
    this.saveToDisk();
    return playlist;
  }

  async setLastPlayed(userId: string, song: any) {
    const list = this.recentPlays.get(userId) || [];
    const filtered = list.filter(s => s.id !== song.id);
    this.recentPlays.set(userId, [song, ...filtered].slice(0, 20));
    this.saveToDisk();
    return song;
  }

  async getRecentPlays(userId: string) {
    return this.recentPlays.get(userId) || [];
  }

  async clearRecentPlays(userId: string) {
    this.recentPlays.set(userId, []);
    this.saveToDisk();
    return true;
  }
}
