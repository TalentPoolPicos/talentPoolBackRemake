import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { NotificationDatabaseService } from './notification-database.service';
import {
  NotificationJobData,
  NotificationResult,
} from './interfaces/notification-job.interface';
import { NOTIFICATION_QUEUES } from './constants/queue.constants';

@Processor(NOTIFICATION_QUEUES.NOTIFICATIONS)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly notificationDb: NotificationDatabaseService,
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<NotificationResult> {
    const { data } = job;

    try {
      this.logger.log(
        `Processing notification job ${job.id} for user ${data.userId}`,
      );

      // Criar a notificação no banco de dados
      const notification = await this.prisma.notification.create({
        data: {
          type: data.type,
          title: data.title,
          message: data.message,
          userId: data.userId,
          metadata: data.metadata,
          priority: data.priority || 1,
          expiresAt: data.expiresAt,
          actionUrl: data.actionUrl,
          actionType: data.actionType,
          actionData: data.actionData,
          relatedJobId: data.relatedJobId,
          relatedApplicationId: data.relatedApplicationId,
          relatedUserId: data.relatedUserId,
        },
      });

      this.logger.log(
        `Successfully created notification ${notification.id} for user ${data.userId}`,
      );

      // Enviar notificação via WebSocket em tempo real
      const notificationData = {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        actionUrl: notification.actionUrl,
        actionType: notification.actionType,
        actionData: notification.actionData,
        relatedJobId: notification.relatedJobId,
        relatedApplicationId: notification.relatedApplicationId,
        relatedUserId: notification.relatedUserId,
        createdAt: notification.createdAt,
        metadata: notification.metadata,
      };

      // Verificar se é uma notificação para broadcast
      if (data.metadata?.broadcast) {
        await this.notificationsGateway.broadcastNotification(notificationData);
        this.logger.log(`Broadcasted notification ${notification.id}`);
      } else if (data.metadata?.role) {
        // Enviar para todos os usuários de um papel específico
        await this.notificationsGateway.sendNotificationToRole(
          data.metadata.role,
          notificationData,
        );
        this.logger.log(
          `Sent notification ${notification.id} to role: ${data.metadata.role}`,
        );
      } else {
        // Enviar para usuário específico
        const sent = await this.notificationsGateway.sendNotificationToUser(
          data.userId,
          notificationData,
        );

        if (sent) {
          this.logger.log(
            `Sent real-time notification ${notification.id} to user ${data.userId}`,
          );
        }
      }

      // Atualizar contagem de não lidas para o usuário
      const unreadCount = await this.prisma.notification.count({
        where: { userId: data.userId, readAt: null },
      });

      await this.notificationsGateway.sendUnreadCount(data.userId, unreadCount);

      return {
        success: true,
        notificationId: notification.id,
      };
    } catch (error) {
      this.logger.error(
        `Failed to process notification job ${job.id}:`,
        error.stack,
      );

      return {
        success: false,
        error: error.message,
      };
    }
  }
}
