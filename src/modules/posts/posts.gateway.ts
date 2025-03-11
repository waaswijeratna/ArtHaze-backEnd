import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { PostsService } from './posts.service';

@WebSocketGateway(4000, { cors: { origin: '*' } })
export class PostsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly postsService: PostsService) {}

  @SubscribeMessage('addReaction')
  async handleReaction(
    @MessageBody()
    data: {
      postId: string;
      userId: string;
      reactionName: string;
    },
  ) {
    const updatedPost = await this.postsService.addReaction(
      data.postId,
      data.userId,
      data.reactionName,
    );

    // Emit updated post to all connected clients
    this.server.emit('reactionUpdated', updatedPost);

    return updatedPost;
  }
}
