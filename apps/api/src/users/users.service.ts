import { Injectable, NotFoundException } from '@nestjs/common';
import { StoreService } from '../store.service';

@Injectable()
export class UsersService {
  constructor(private readonly store: StoreService) {}

  async findByFirebaseId(firebaseId: string) {
    return this.store.syncUser({ uid: firebaseId });
  }

  async syncUser(data: any) {
    return this.store.syncUser(data);
  }

  async likeSong(userId: string, song: any) {
    return this.store.likeSong(userId, song);
  }

  async getLikedSongs(userId: string) {
    return this.store.getLiked(userId);
  }

  // --- Playlists ---
  async createPlaylist(userId: string, name: string) {
    return this.store.createPlaylist(userId, name);
  }

  async getPlaylists(userId: string) {
    return this.store.getPlaylists(userId);
  }

  async addToPlaylist(userId: string, playlistId: string, song: any) {
    return this.store.addToPlaylist(userId, playlistId, song);
  }

  async removeFromPlaylist(userId: string, playlistId: string, songId: string) {
    return this.store.removeFromPlaylist(userId, playlistId, songId);
  }

  async updateLastPlayed(userId: string, song: any) {
    return this.store.setLastPlayed(userId, song);
  }

  async getRecentPlays(userId: string) {
    return this.store.getRecentPlays(userId);
  }
}
