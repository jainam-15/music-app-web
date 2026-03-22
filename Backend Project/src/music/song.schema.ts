import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Song extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  artist: string;

  @Prop()
  album: string;

  @Prop({ required: true })
  url: string;

  @Prop()
  duration: number;

  @Prop()
  cover: string;

  @Prop()
  genre: string;

  @Prop({ default: 'mp3' })
  streamType: string;
}

export const SongSchema = SchemaFactory.createForClass(Song);
