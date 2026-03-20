import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SyncGateway {
  @WebSocketServer()
  server: Server;

  private userRoomPrefix = 'user-';

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`${this.userRoomPrefix}${userId}`);
    console.log(`User ${userId} joined room`);
  }

  @SubscribeMessage('playback-state')
  handlePlaybackState(
    @MessageBody() data: { userId: string; state: any },
  ) {
    // Broadcast to all other devices of the same user
    const room = `${this.userRoomPrefix}${data.userId}`;
    this.server.to(room).emit('playback-update', data.state);
  }

  @SubscribeMessage('queue-update')
  handleQueueUpdate(
    @MessageBody() data: { userId: string; queue: any[] },
  ) {
    const room = `${this.userRoomPrefix}${data.userId}`;
    this.server.to(room).emit('queue-synced', data.queue);
  }
}
