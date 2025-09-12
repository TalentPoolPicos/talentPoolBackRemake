import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import {
  NotificationJobData,
  NotificationJobOptions,
} from './interfaces/notification-job.interface';
import {
  NOTIFICATION_QUEUES,
  NOTIFICATION_JOBS,
} from './constants/queue.constants';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectQueue(NOTIFICATION_QUEUES.NOTIFICATIONS)
    private readonly notificationsQueue: Queue,
    @InjectQueue(NOTIFICATION_QUEUES.EMAIL_NOTIFICATIONS)
    private readonly emailQueue: Queue,
    @InjectQueue(NOTIFICATION_QUEUES.PUSH_NOTIFICATIONS)
    private readonly pushQueue: Queue,
    @InjectQueue(NOTIFICATION_QUEUES.WEBSOCKET_NOTIFICATIONS)
    private readonly websocketQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Criar uma notificação no sistema
   */
  async createNotification(
    createNotificationDto: CreateNotificationDto,
    options?: NotificationJobOptions,
  ) {
    try {
      const jobData: NotificationJobData = {
        ...createNotificationDto,
        expiresAt: createNotificationDto.expiresAt
          ? new Date(createNotificationDto.expiresAt)
          : undefined,
      };

      const job = await this.notificationsQueue.add(
        NOTIFICATION_JOBS.CREATE_NOTIFICATION,
        jobData,
        {
          priority: options?.priority || 1,
          delay: options?.delay || 0,
          attempts: options?.attempts || 3,
          backoff: options?.backoff || {
            type: 'exponential',
            delay: 2000,
          },
        },
      );

      this.logger.log(
        `Notification job ${job.id} created for user ${createNotificationDto.userId}`,
      );

      return {
        success: true,
        jobId: job.id,
        message: 'Notification queued successfully',
      };
    } catch (error) {
      this.logger.error('Failed to create notification:', error.stack);
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  /**
   * Enviar notificação por email
   */
  async sendEmailNotification(
    createNotificationDto: CreateNotificationDto,
    emailData?: {
      subject?: string;
      template?: string;
      attachments?: any[];
    },
    options?: NotificationJobOptions,
  ) {
    try {
      const jobData: NotificationJobData = {
        ...createNotificationDto,
        expiresAt: createNotificationDto.expiresAt
          ? new Date(createNotificationDto.expiresAt)
          : undefined,
        metadata: {
          ...createNotificationDto.metadata,
          email: emailData,
        },
      };

      const job = await this.emailQueue.add(
        NOTIFICATION_JOBS.CREATE_NOTIFICATION,
        jobData,
        {
          priority: options?.priority || 2,
          delay: options?.delay || 0,
          attempts: options?.attempts || 5,
          backoff: options?.backoff || {
            type: 'exponential',
            delay: 3000,
          },
        },
      );

      this.logger.log(
        `Email notification job ${job.id} created for user ${createNotificationDto.userId}`,
      );

      return {
        success: true,
        jobId: job.id,
        message: 'Email notification queued successfully',
      };
    } catch (error) {
      this.logger.error('Failed to send email notification:', error.stack);
      throw new Error(`Failed to send email notification: ${error.message}`);
    }
  }

  /**
   * Enviar push notification
   */
  async sendPushNotification(
    createNotificationDto: CreateNotificationDto,
    pushData?: {
      deviceTokens?: string[];
      sound?: string;
      badge?: number;
      icon?: string;
      image?: string;
      clickAction?: string;
    },
    options?: NotificationJobOptions,
  ) {
    try {
      const jobData: NotificationJobData = {
        ...createNotificationDto,
        expiresAt: createNotificationDto.expiresAt
          ? new Date(createNotificationDto.expiresAt)
          : undefined,
        metadata: {
          ...createNotificationDto.metadata,
          push: pushData,
        },
      };

      const job = await this.pushQueue.add(
        NOTIFICATION_JOBS.CREATE_NOTIFICATION,
        jobData,
        {
          priority: options?.priority || 1,
          delay: options?.delay || 0,
          attempts: options?.attempts || 3,
          backoff: options?.backoff || {
            type: 'exponential',
            delay: 1000,
          },
        },
      );

      this.logger.log(
        `Push notification job ${job.id} created for user ${createNotificationDto.userId}`,
      );

      return {
        success: true,
        jobId: job.id,
        message: 'Push notification queued successfully',
      };
    } catch (error) {
      this.logger.error('Failed to send push notification:', error.stack);
      throw new Error(`Failed to send push notification: ${error.message}`);
    }
  }

  /**
   * Enviar notificação via WebSocket
   */
  async sendWebSocketNotification(
    createNotificationDto: CreateNotificationDto,
    websocketData?: {
      room?: string;
      event?: string;
      broadcast?: boolean;
    },
    options?: NotificationJobOptions,
  ) {
    try {
      const jobData: NotificationJobData = {
        ...createNotificationDto,
        expiresAt: createNotificationDto.expiresAt
          ? new Date(createNotificationDto.expiresAt)
          : undefined,
        metadata: {
          ...createNotificationDto.metadata,
          websocket: websocketData,
        },
      };

      const job = await this.websocketQueue.add(
        NOTIFICATION_JOBS.CREATE_NOTIFICATION,
        jobData,
        {
          priority: options?.priority || 3,
          delay: options?.delay || 0,
          attempts: options?.attempts || 2,
          backoff: options?.backoff || {
            type: 'fixed',
            delay: 500,
          },
        },
      );

      this.logger.log(
        `WebSocket notification job ${job.id} created for user ${createNotificationDto.userId}`,
      );

      return {
        success: true,
        jobId: job.id,
        message: 'WebSocket notification queued successfully',
      };
    } catch (error) {
      this.logger.error('Failed to send WebSocket notification:', error.stack);
      throw new Error(
        `Failed to send WebSocket notification: ${error.message}`,
      );
    }
  }

  /**
   * Método conveniente para enviar notificação completa (múltiplos canais)
   */
  async sendFullNotification(
    createNotificationDto: CreateNotificationDto,
    channels: {
      email?: boolean;
      push?: boolean;
      websocket?: boolean;
    } = { email: true, push: true, websocket: true },
    extraData?: {
      emailData?: any;
      pushData?: any;
      websocketData?: any;
    },
    options?: NotificationJobOptions,
  ) {
    const results: Array<{
      type: string;
      result: {
        success: boolean;
        jobId?: string;
        message: string;
      };
    }> = [];

    try {
      // Sempre criar a notificação no banco
      const notificationResult = await this.createNotification(
        createNotificationDto,
        options,
      );
      results.push({ type: 'notification', result: notificationResult });

      // Enviar por email se solicitado
      if (channels.email) {
        const emailResult = await this.sendEmailNotification(
          createNotificationDto,
          extraData?.emailData,
          options,
        );
        results.push({ type: 'email', result: emailResult });
      }

      // Enviar push notification se solicitado
      if (channels.push) {
        const pushResult = await this.sendPushNotification(
          createNotificationDto,
          extraData?.pushData,
          options,
        );
        results.push({ type: 'push', result: pushResult });
      }

      // Enviar WebSocket se solicitado
      if (channels.websocket) {
        const websocketResult = await this.sendWebSocketNotification(
          createNotificationDto,
          extraData?.websocketData,
          options,
        );
        results.push({ type: 'websocket', result: websocketResult });
      }

      this.logger.log(
        `Full notification sent for user ${createNotificationDto.userId} across ${results.length} channels`,
      );

      return {
        success: true,
        results,
        message: 'Full notification sent successfully',
      };
    } catch (error) {
      this.logger.error('Failed to send full notification:', error.stack);
      throw new Error(`Failed to send full notification: ${error.message}`);
    }
  }

  /**
   * Buscar notificações do usuário
   */
  async getUserNotifications(
    userId: number,
    options: {
      page?: number;
      limit?: number;
      unreadOnly?: boolean;
      type?: NotificationType;
    } = {},
  ) {
    const { page = 1, limit = 20, unreadOnly = false, type } = options;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (unreadOnly) {
      where.readAt = null;
    }

    if (type) {
      where.type = type;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Marcar notificação como lida
   */
  async markAsRead(notificationId: number, userId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.readAt) {
      return { message: 'Notification already read' };
    }

    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });

    return { message: 'Notification marked as read' };
  }

  /**
   * Marcar todas as notificações como lidas
   */
  async markAllAsRead(userId: number) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });

    return {
      message: `${result.count} notifications marked as read`,
      count: result.count,
    };
  }

  /**
   * Deletar notificação
   */
  async deleteNotification(notificationId: number, userId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });

    return { message: 'Notification deleted successfully' };
  }

  /**
   * Contar notificações não lidas
   */
  async getUnreadCount(userId: number) {
    const count = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });

    return { unreadCount: count };
  }

  /**
   * Limpar notificações expiradas
   */
  async cleanExpiredNotifications() {
    const result = await this.prisma.notification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    this.logger.log(`Cleaned ${result.count} expired notifications`);

    return {
      message: `${result.count} expired notifications cleaned`,
      count: result.count,
    };
  }

  /**
   * Obter estatísticas das filas
   */
  async getQueueStats() {
    const [notificationsStats, emailStats, pushStats, websocketStats] =
      await Promise.all([
        this.notificationsQueue.getJobCounts(),
        this.emailQueue.getJobCounts(),
        this.pushQueue.getJobCounts(),
        this.websocketQueue.getJobCounts(),
      ]);

    return {
      notifications: notificationsStats,
      email: emailStats,
      push: pushStats,
      websocket: websocketStats,
    };
  }
}
