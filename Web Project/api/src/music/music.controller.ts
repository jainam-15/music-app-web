import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { MusicService } from './music.service';
import { Song } from './song.schema';

@Controller('music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Get('songs')
  async getAll(): Promise<Song[]> {
    return this.musicService.findAll();
  }

  @Get('songs/:id')
  async getOne(@Param('id') id: string): Promise<Song | null> {
    return this.musicService.findOne(id);
  }

  @Post('songs')
  async create(@Body() song: any): Promise<Song> {
    return this.musicService.create(song);
  }
}
