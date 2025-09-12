import { Injectable, Logger } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationDatabaseService } from './notification-database.service';
import { NotificationType } from '@prisma/client';

export interface JobNotificationData {
  jobId: number;
  title: string;
  enterpriseId: number;
  excludeUserId?: number; // Para excluir o próprio usuário que criou a vaga
}

export interface ApplicationNotificationData {
  applicationId: number;
  jobId: number;
  studentId: number;
  enterpriseId: number;
}

export interface ProfileLikeNotificationData {
  likerId: number;
  likedUserId: number;
}

export interface SystemNotificationData {
  title: string;
  message: string;
  userIds?: number[]; // Se não fornecido, envia para todos
  type?: 'announcement' | 'maintenance' | 'update';
}

@Injectable()
export class NotificationManagerService {
  private readonly logger = new Logger(NotificationManagerService.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationDb: NotificationDatabaseService,
  ) {}

  /**
   * Notifica sobre nova candidatura em vaga
   * Envia notificação para a empresa
   */
  async notifyJobApplication(data: ApplicationNotificationData): Promise<void> {
    try {
      this.logger.log(`Notifying job application: ${data.applicationId}`);

      // Para usar o método correto, precisaríamos buscar os dados adicionais
      // Por simplicidade da demo, vou usar createNotification diretamente
      await this.notificationsService.createNotification({
        userId: data.enterpriseId,
        type: NotificationType.job_application_received,
        title: 'Nova candidatura recebida',
        message: 'Um estudante se candidatou para uma de suas vagas',
        relatedApplicationId: data.applicationId,
        relatedJobId: data.jobId,
        relatedUserId: data.studentId,
        priority: 2,
      });

      this.logger.log('Job application notification sent successfully');
    } catch (error) {
      this.logger.error('Failed to send job application notification:', error);
      throw error;
    }
  }

  /**
   * Notifica sobre nova vaga publicada
   * Envia para estudantes que podem se interessar
   */
  async notifyNewJob(data: JobNotificationData): Promise<void> {
    try {
      this.logger.log(`Notifying new job: ${data.jobId}`);

      // Busca usuários elegíveis para receber notificação de vaga
      const eligibleUsers =
        await this.notificationDb.getUsersForJobNotification(data.jobId);

      if (eligibleUsers.length === 0) {
        this.logger.log('No eligible users found for job notification');
        return;
      }

      // Envia notificação para cada usuário elegível
      const notifications = eligibleUsers.map((user) =>
        this.notificationsService.createNotification({
          userId: user.id,
          type: NotificationType.job_published,
          title: 'Nova vaga disponível',
          message: `Uma nova vaga "${data.title}" foi publicada e pode ser do seu interesse!`,
          relatedJobId: data.jobId,
          relatedUserId: data.enterpriseId,
        }),
      );

      await Promise.all(notifications);

      this.logger.log(
        `New job notification sent to ${eligibleUsers.length} users`,
      );
    } catch (error) {
      this.logger.error('Failed to send new job notification:', error);
      throw error;
    }
  }

  /**
   * Notifica sobre like no perfil
   */
  async notifyProfileLike(data: ProfileLikeNotificationData): Promise<void> {
    try {
      this.logger.log(
        `Notifying profile like: ${data.likerId} -> ${data.likedUserId}`,
      );

      await this.notificationsService.notifyProfileLiked(
        data.likedUserId,
        data.likerId,
        'Usuário', // Nome genérico para demo
      );

      this.logger.log('Profile like notification sent successfully');
    } catch (error) {
      this.logger.error('Failed to send profile like notification:', error);
      throw error;
    }
  }

  /**
   * Envia notificação do sistema
   */
  async notifySystemMessage(data: SystemNotificationData): Promise<void> {
    try {
      this.logger.log(`Sending system notification: ${data.title}`);

      if (data.userIds && data.userIds.length > 0) {
        // Envia para usuários específicos
        const notifications = data.userIds.map((userId) =>
          this.notificationsService.createNotification({
            userId,
            type: NotificationType.system_announcement,
            title: data.title,
            message: data.message,
          }),
        );

        await Promise.all(notifications);
        this.logger.log(
          `System notification sent to ${data.userIds.length} specific users`,
        );
      } else {
        // Broadcast para todos os usuários conectados
        await this.notificationsService.broadcastNotification(
          NotificationType.system_announcement,
          data.title,
          data.message,
        );

        this.logger.log('System notification broadcasted to all users');
      }
    } catch (error) {
      this.logger.error('Failed to send system notification:', error);
      throw error;
    }
  }

  /**
   * Notifica sobre atualização de status de candidatura
   */
  async notifyApplicationStatusUpdate(
    applicationId: number,
    newStatus: string,
    studentId: number,
    jobTitle: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `Notifying application status update: ${applicationId} -> ${newStatus}`,
      );

      const statusMessages = {
        accepted: 'Parabéns! Sua candidatura foi aceita',
        rejected: 'Sua candidatura não foi selecionada desta vez',
        interview: 'Você foi selecionado para entrevista',
        pending: 'Sua candidatura está sendo analisada',
      };

      const message =
        statusMessages[newStatus] ||
        `Status da sua candidatura foi atualizado para: ${newStatus}`;

      await this.notificationsService.createNotification({
        userId: studentId,
        type: NotificationType.job_application_received, // Reutilizando o tipo mais próximo
        title: 'Atualização de Candidatura',
        message: `${message} para a vaga "${jobTitle}"`,
        relatedApplicationId: applicationId,
      });

      this.logger.log('Application status notification sent successfully');
    } catch (error) {
      this.logger.error(
        'Failed to send application status notification:',
        error,
      );
      throw error;
    }
  }

  /**
   * Notifica sobre mensagem privada ou chat
   */
  async notifyPrivateMessage(
    senderId: number,
    receiverId: number,
    message: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `Notifying private message: ${senderId} -> ${receiverId}`,
      );

      await this.notificationsService.createNotification({
        userId: receiverId,
        type: NotificationType.profile_liked, // Reutilizando o tipo mais próximo
        title: 'Nova mensagem',
        message:
          message.length > 100 ? `${message.substring(0, 100)}...` : message,
        relatedUserId: senderId,
      });

      this.logger.log('Private message notification sent successfully');
    } catch (error) {
      this.logger.error('Failed to send private message notification:', error);
      throw error;
    }
  }

  /**
   * Obtém notificações de um usuário
   */
  async getUserNotifications(userId: number, unreadOnly = false) {
    return this.notificationDb.getUserNotifications(userId, {
      isRead: unreadOnly ? false : undefined,
    });
  }

  /**
   * Marca notificação como lida
   */
  async markAsRead(notificationId: number, userId: number): Promise<boolean> {
    const result = await this.notificationDb.markAsRead(notificationId, userId);
    return result !== null;
  }

  /**
   * Marca múltiplas notificações como lidas
   */
  async markMultipleAsRead(
    notificationIds: number[],
    userId: number,
  ): Promise<number> {
    return this.notificationDb.markMultipleAsRead(notificationIds, userId);
  }

  /**
   * Marca todas as notificações de um usuário como lidas
   */
  async markAllAsRead(userId: number): Promise<number> {
    return this.notificationDb.markAllAsRead(userId);
  }

  /**
   * Obtém contagem de notificações não lidas
   */
  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationDb.getUnreadCount(userId);
  }

  /**
   * Obtém estatísticas de notificações do usuário
   */
  async getUserNotificationStats(userId: number) {
    return this.notificationDb.getUserNotificationStats(userId);
  }

  /**
   * Limpeza automática de notificações antigas
   */
  async cleanupOldNotifications(): Promise<number> {
    return this.notificationDb.cleanupExpiredNotifications();
  }
}
