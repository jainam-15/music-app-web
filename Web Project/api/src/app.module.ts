import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MusicModule } from './music/music.module';
import { SyncModule } from './sync/sync.module';
import { UsersModule } from './users/users.module';
import { StoreService } from './store.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // MongooseModule commented out for demo stability
    // MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/musicapp'),
    MusicModule,
    SyncModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, StoreService],
  exports: [StoreService],
})
export class AppModule {}
