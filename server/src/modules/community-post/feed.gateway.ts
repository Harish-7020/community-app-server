import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JWTService } from 'src/shared/services/jwt.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityMember } from 'src/shared/entities/community-member.entity';

@WebSocketGateway({
  namespace: '/feed',
  cors: { origin: '*' },
})
export class FeedGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(FeedGateway.name);

  constructor(
    private readonly jwtService: JWTService,
    @InjectRepository(CommunityMember)
    private readonly memberRepo: Repository<CommunityMember>,
  ) {}

  async handleConnection(client: Socket) {
    try {
      console.log('🔌 New Feed WebSocket connection attempt:', {
        id: client.id,
        headers: client.handshake.headers,
        auth: client.handshake.auth,
      });

      // Accept token from multiple sources
      let token: string | undefined = undefined;
      const headers = client.handshake.headers || ({} as any);
      const authHeader = (headers['authorization'] || headers['Authorization']) as string | undefined;
      const headerToken = headers['token'] as string | undefined;
      const authToken = (client.handshake.auth && (client.handshake.auth as any).token) as string | undefined;

      token = headerToken || authToken || authHeader;
      console.log('🔑 Feed Token sources:', { headerToken: !!headerToken, authToken: !!authToken, authHeader: !!authHeader });
      
      if (!token) throw new UnauthorizedException('NO_TOKEN_PROVIDED');

      // Normalize Bearer prefix
      if (token.startsWith('Bearer ')) token = token.slice(7);

      console.log('🔐 Verifying Feed token...');
      const payload = await this.jwtService.verifyAccessTokenAndGetPayload(token as string);
      const userId = payload.userID;
      if (!userId) throw new UnauthorizedException('INVALID_TOKEN_PAYLOAD');

      // Join user-specific room
      const userRoom = this.getUserRoom(userId);
      client.join(userRoom);
      client.data.userId = userId;

      // Join all community rooms that the user is a member of
      const memberships = await this.memberRepo.find({
        where: { user: { userID: userId } },
        relations: ['community'],
      });

      for (const membership of memberships) {
        const communityRoom = this.getCommunityRoom(membership.community.id);
        client.join(communityRoom);
      }

      this.logger.log(`✅ Feed connected: user=${userId}, socket=${client.id}, communities=${memberships.length}`);
    } catch (err) {
      this.logger.warn(`❌ Feed connection rejected: ${err.message}`);
      console.error('🚨 Feed WebSocket connection error details:', err);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Feed client disconnected: ${client.id}`);
  }

  getUserRoom(userId: number | string) {
    return `user_${userId}`;
  }

  getCommunityRoom(communityId: number | string) {
    return `community_${communityId}`;
  }

  /**
   * Emit a new post to all members of a community
   */
  emitNewPostToCommunity(communityId: number, postData: any) {
    const room = this.getCommunityRoom(communityId);
    this.server.to(room).emit('new_post', postData);
    this.logger.log(`📨 New post emitted to community_${communityId}`);
  }

  /**
   * Emit post update to all members of a community
   */
  emitPostUpdate(communityId: number, postData: any) {
    const room = this.getCommunityRoom(communityId);
    console.log(`📝 Attempting to emit post update to community_${communityId} in room: ${room}`);
    console.log(`📝 Post update data:`, postData);
    
    // Check if there are any clients in the room
    try {
      const clientsInRoom = this.server.sockets.adapter.rooms?.get(room);
      console.log(`📝 Clients in room ${room}:`, clientsInRoom ? clientsInRoom.size : 0);
      
      // Log all connected clients and their rooms
      console.log(`📝 All connected clients:`, Array.from(this.server.sockets.sockets.keys()));
      console.log(`📝 All rooms:`, Array.from(this.server.sockets.adapter.rooms.keys()));
    } catch (error) {
      console.log(`📝 Could not check room size:`, error.message);
    }
    
    this.server.to(room).emit('post_updated', postData);
    this.logger.log(`📝 Post update emitted to community_${communityId}`);
  }

  /**
   * Emit post deletion to all members of a community
   */
  emitPostDeletion(communityId: number, postId: number) {
    const room = this.getCommunityRoom(communityId);
    this.server.to(room).emit('post_deleted', { postId });
    this.logger.log(`🗑️ Post deletion emitted to community_${communityId}`);
  }
}

