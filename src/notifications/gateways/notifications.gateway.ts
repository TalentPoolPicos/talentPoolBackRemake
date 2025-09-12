import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  userRole?: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedUsers = new Map<number, string>(); // userId -> socketId

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized for notifications');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} disconnected: No token provided`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, role: true, email: true },
      });

      if (!user) {
        this.logger.warn(`Client ${client.id} disconnected: Invalid user`);
        client.disconnect();
        return;
      }

      client.userId = user.id;
      client.userRole = user.role;
      this.connectedUsers.set(user.id, client.id);

      // Juntar o usuário a uma sala específica
      await client.join(`user:${user.id}`);
      await client.join(`role:${user.role}`);

      this.logger.log(
        `User ${user.id} (${user.email}) connected with socket ${client.id}`,
      );

      // Notificar que o usuário está online
      client.emit('connection-status', {
        status: 'connected',
        userId: user.id,
      });
    } catch (error) {
      this.logger.error(
        `Connection error for client ${client.id}:`,
        error.message,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      this.logger.log(`User ${client.userId} disconnected`);
    }
  }

  /**
   * Enviar notificação para usuário específico
   */
  sendNotificationToUser(userId: number, notification: any) {
    const socketId = this.connectedUsers.get(userId);

    if (socketId) {
      // Usuário está online - enviar via WebSocket
      this.server.to(`user:${userId}`).emit('new-notification', notification);

      this.logger.log(`Sent real-time notification to user ${userId}`);
      return true;
    } else {
      // Usuário está offline - notificação ficará no banco para próxima conexão
      this.logger.log(
        `User ${userId} is offline - notification saved for later`,
      );
      return false;
    }
  }

  /**
   * Enviar notificação para todos os usuários de um papel específico
   */
  sendNotificationToRole(role: string, notification: any) {
    this.server.to(`role:${role}`).emit('new-notification', notification);
    this.logger.log(`Sent notification to all users with role: ${role}`);
  }

  /**
   * Broadcast para todos os usuários conectados
   */
  broadcastNotification(notification: any) {
    this.server.emit('broadcast-notification', notification);
    this.logger.log('Broadcasted notification to all connected users');
  }

  /**
   * Verificar se usuário está online
   */
  isUserOnline(userId: number): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * Obter lista de usuários online
   */
  getOnlineUsers(): number[] {
    return Array.from(this.connectedUsers.keys());
  }

  /**
   * Enviar contagem de notificações não lidas
   */
  sendUnreadCount(userId: number, count: number) {
    this.server
      .to(`user:${userId}`)
      .emit('unread-count', { unreadCount: count });
  }
}
