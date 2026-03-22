import { Injectable } from '@nestjs/common';

@Injectable()
export class MusicService {
  private mockSongs = [
    {
      id: "saavn-1",
      title: "Neon Dreams",
      artist: "Synthwave Master",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      duration: 372,
      cover: "https://generated-image.com/neon-dreams-cover",
      genre: "Synthwave",
      streamType: "mp3",
    },
    {
      id: "saavn-2",
      title: "Cyber Sunset",
      artist: "Future Bassist",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      duration: 425,
      cover: "https://generated-image.com/cyber-sunset-cover",
      genre: "Bass",
      streamType: "mp3",
    }
  ];

  constructor() {} // DB Connection removed for Demo stability

  async findAll(): Promise<any[]> {
    return this.mockSongs;
  }

  async findOne(id: string): Promise<any | null> {
    return this.mockSongs.find(s => s.id === id) || null;
  }

  async create(song: any): Promise<any> {
    this.mockSongs.push(song);
    return song;
  }
}
