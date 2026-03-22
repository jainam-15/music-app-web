import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  firebaseId: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  displayName: string;

  @Prop()
  photoURL: string;

  @Prop({ type: [{ id: String, title: String, artist: String, cover: String, url: String, duration: Number }] })
  likedSongs: any[];

  @Prop({ type: [{ name: String, songs: Array }] })
  playlists: any[];

  @Prop({ type: Object })
  lastPlayed: any;
}

export const UserSchema = SchemaFactory.createForClass(User);
