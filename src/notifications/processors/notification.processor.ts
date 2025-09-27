import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsGateway } from '../gateways/notifications.gateway';
import {
  CreateNotificationData,
  NotificationResult,
} from '../services/notification.service';
import {
  NOTIFICATION_QUEUES,
  NOTIFICATION_JOBS,
} from '../constants/queue.constants';

@Processor(NOTIFICATION_QUEUES.NOTIFICATIONS)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {
    super();
  }

  async process(job: Job<CreateNotificationData>): Promise<NotificationResult> {
    const { name, data } = job;

    try {
      this.logger.log(
        `Processing notification job: ${name} for user ${data.userId}`,
      );

      // Processar baseado no tipo de job
      switch (name) {
        case NOTIFICATION_JOBS.CREATE_NOTIFICATION:
          return await this.processCreateNotification(data);
        default:
          this.logger.warn(`Unknown job type: ${name}`);
          return await this.processCreateNotification(data);
      }
    } catch (error) {
      this.logger.error(
        `Failed to process notification job: ${error.message}`,
        error.stack,
      );

      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async processCreateNotification(
    data: CreateNotificationData,
  ): Promise<NotificationResult> {
    try {
      // Validar dados obrigatórios
      if (!data.userId || !data.type || !data.title || !data.message) {
        throw new Error('Missing required notification data');
      }

      const notification = await this.prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          metadata: data.metadata || null,
          priority: data.priority || 1,
          expiresAt: data.expiresAt || null,
          actionUrl: data.actionUrl || null,
          actionType: data.actionType || null,
          actionData: data.actionData || null,
          relatedJobId: data.relatedJobId || null,
          relatedApplicationId: data.relatedApplicationId || null,
          relatedUserId: data.relatedUserId || null,
        },
      });

      // Enviar via WebSocket em tempo real
      try {
        this.notificationsGateway.sendNotificationToUser(
          data.userId,
          notification,
        );
      } catch (wsError) {
        this.logger.warn(
          `Failed to send WebSocket notification to user ${data.userId}: ${wsError.message}`,
        );
        // Não falha o job se o WebSocket falhar
      }

      this.logger.log(
        `Notification processed successfully: ${notification.id}`,
      );

      return {
        success: true,
        notificationId: notification.id,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create notification: ${error.message}`,
        error.stack,
      );

      return {
        success: false,
        error: error.message,
      };
    }
  }
}
