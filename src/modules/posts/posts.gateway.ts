import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class PostsGateway {
  @WebSocketServer()
  server: Server;

  emitPostLikeUpdate(postId: string, likes: string[]) {
    this.server.emit('postLikeUpdate', { postId, likes });
  }
}
