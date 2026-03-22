import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sync')
  async sync(@Body() userData: any) {
    return this.usersService.syncUser(userData);
  }

  @Post('like')
  async like(@Body() { userId, song }: any) {
    return this.usersService.likeSong(userId, song);
  }

  @Get('liked/:id')
  async getLiked(@Param('id') userId: string) {
    return this.usersService.getLikedSongs(userId);
  }

  // --- Playlist Endpoints ---
  @Post('playlists')
  async create(@Body() { userId, name }: any) {
    return this.usersService.createPlaylist(userId, name);
  }

  @Post('playlists/delete')
  async delete(@Body() { userId, playlistId }: any) {
    return this.usersService.deletePlaylist(userId, playlistId);
  }

  @Get('playlists/:userId')
  async getPlaylists(@Param('userId') userId: string) {
    return this.usersService.getPlaylists(userId);
  }

  @Post('playlists/add')
  async add(@Body() { userId, playlistId, song }: any) {
    return this.usersService.addToPlaylist(userId, playlistId, song);
  }

  @Post('playlists/remove')
  async remove(@Body() { userId, playlistId, songId }: any) {
    return this.usersService.removeFromPlaylist(userId, playlistId, songId);
  }

  @Post('last-played')
  async lastPlayed(@Body() { userId, song }: any) {
    return this.usersService.updateLastPlayed(userId, song);
  }

  @Get('last-played/:id')
  async getRecentPlays(@Param('id') userId: string) {
    return this.usersService.getRecentPlays(userId);
  }

  @Post('clear-recent-plays')
  async clearRecentPlays(@Body() { userId }: any) {
    return this.usersService.clearRecentPlays(userId);
  }

  @Get('clear-test')
  async clearTest() {
    return { status: 'ok' };
  }
}
