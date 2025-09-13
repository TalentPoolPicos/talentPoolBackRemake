import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NotificationDatabaseService } from './notification-database.service';
import { NotificationsService } from './notifications.service';
import { NOTIFICATION_QUEUES } from './constants/queue.constants';
import { NotificationType } from '@prisma/client';
import {
  JobPublishedNotificationData,
  JobPublishedNotificationResult,
} from './interfaces/job-notification.interface';

@Processor(NOTIFICATION_QUEUES.JOB_NOTIFICATIONS)
@Injectable()
export class JobNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(JobNotificationProcessor.name);

  constructor(
    private readonly notificationDb: NotificationDatabaseService,
    private readonly notificationsService: NotificationsService,
  ) {
    super();
  }

  async process(
    job: Job<JobPublishedNotificationData>,
  ): Promise<JobPublishedNotificationResult> {
    const { data } = job;

    try {
      this.logger.log(
        `Processing job notification ${job.id} for job ${data.jobUuid}`,
      );

      // Buscar usuários conectados à empresa
      const connectedUsers =
        await this.notificationDb.getUsersConnectedToEnterprise(
          data.enterpriseUserId,
        );

      if (connectedUsers.length === 0) {
        this.logger.log(
          `No connected users found for enterprise ${data.enterpriseName}`,
        );
        return {
          success: true,
          notificationsSent: 0,
        };
      }

      // Criar notificações para todos os usuários conectados
      const notificationPromises = connectedUsers.map((user) =>
        this.notificationsService.createNotification({
          userId: user.id,
          type: NotificationType.job_published,
          title: `${data.enterpriseName} publicou uma nova vaga!`,
          message: `A empresa ${data.enterpriseName} publicou a vaga "${data.jobTitle}". Você pode estar interessado!`,
          priority: 2,
          relatedJobId: data.jobId,
          relatedUserId: data.enterpriseUserId,
          actionUrl: `/jobs/${data.jobUuid}`,
          actionType: 'view_job',
          actionData: {
            jobId: data.jobId,
            jobUuid: data.jobUuid,
            enterpriseId: data.enterpriseId,
          },
          metadata: {
            jobTitle: data.jobTitle,
            enterpriseName: data.enterpriseName,
            jobLocation: data.jobLocation,
            notificationSource: 'enterprise_connection',
          },
        }),
      );

      // Aguardar todas as notificações serem criadas
      await Promise.all(notificationPromises);

      this.logger.log(
        `Successfully sent ${connectedUsers.length} job notifications for job ${data.jobUuid}`,
      );

      return {
        success: true,
        notificationsSent: connectedUsers.length,
      };
    } catch (error) {
      this.logger.error(
        `Failed to process job notification ${job.id}:`,
        error.stack,
      );

      return {
        success: false,
        notificationsSent: 0,
        error: error.message,
      };
    }
  }
}
