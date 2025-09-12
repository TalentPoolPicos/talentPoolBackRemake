import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotificationJobData,
  NotificationResult,
} from './interfaces/notification-job.interface';
import { NOTIFICATION_QUEUES } from './constants/queue.constants';

@Processor(NOTIFICATION_QUEUES.NOTIFICATIONS)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly prisma: PrismaService) {
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

      // Aqui você pode adicionar lógica adicional como:
      // - Enviar push notification
      // - Enviar email
      // - Enviar WebSocket event
      // - Etc.

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
