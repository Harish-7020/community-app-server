import {
    WebSocketGateway,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { Logger, UnauthorizedException } from '@nestjs/common';
  import { JWTService } from 'src/shared/services/jwt.service';
  
  @WebSocketGateway({
    namespace: '/notifications',
    cors: { origin: '*' },
  })
  export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    private readonly logger = new Logger(NotificationGateway.name);
  
    constructor(private readonly jwtService: JWTService) {}
  
  async handleConnection(client: Socket) {
      try {
        console.log('🔌 New WebSocket connection attempt:', {
          id: client.id,
          headers: client.handshake.headers,
          auth: client.handshake.auth,
        });

        // Accept token from multiple sources for robustness
        let token: string | undefined = undefined;
        const headers = client.handshake.headers || ({} as any);
        const authHeader = (headers['authorization'] || headers['Authorization']) as string | undefined;
        const headerToken = headers['token'] as string | undefined;
        const authToken = (client.handshake.auth && (client.handshake.auth as any).token) as string | undefined;

        token = headerToken || authToken || authHeader;
        console.log('🔑 Token sources:', { headerToken: !!headerToken, authToken: !!authToken, authHeader: !!authHeader });
        
        if (!token) throw new UnauthorizedException('NO_TOKEN_PROVIDED');

        // Normalize Bearer prefix
        if (token.startsWith('Bearer ')) token = token.slice(7);

        console.log('🔐 Verifying token...');
        const payload = await this.jwtService.verifyAccessTokenAndGetPayload(token as string);
        const userId = payload.userID;
        if (!userId) throw new UnauthorizedException('INVALID_TOKEN_PAYLOAD');

        const room = this.getUserRoom(userId);
        client.join(room);
        client.data.userId = userId;
        this.logger.log(`✅ Connected: user=${userId}, socket=${client.id}, room=${room}`);
      } catch (err) {
        this.logger.warn(`❌ Connection rejected: ${err.message}`);
        console.error('🚨 WebSocket connection error details:', err);
        client.disconnect(true);
      }
    }
  
    handleDisconnect(client: Socket) {
      this.logger.log(`Client disconnected: ${client.id}`);
    }
  
    getUserRoom(userId: number | string) {
      return `user_${userId}`;
    }
  
    emitToUser(userId: number | string, payload: any) {
      const room = this.getUserRoom(userId);
      console.log(`📨 Attempting to send notification to user_${userId} in room: ${room}`);
      console.log(`📨 Notification payload:`, payload);
      
      // Check if there are any clients in the room
      try {
        const clientsInRoom = this.server.sockets.adapter.rooms?.get(room);
        console.log(`📨 Clients in room ${room}:`, clientsInRoom ? clientsInRoom.size : 0);
      } catch (error) {
        console.log(`📨 Could not check room size:`, error.message);
      }
      
      this.server.to(room).emit('notification', payload);
      this.logger.log(`📨 Notification sent to user_${userId}`);
    }
  
    @SubscribeMessage('ack')
    handleAck(client: Socket, data: any) {
      return { received: true };
    }
  }
  