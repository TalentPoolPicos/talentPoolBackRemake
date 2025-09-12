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
import { NotificationType, Role } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectQueue(NOTIFICATION_QUEUES.NOTIFICATIONS)
    private readonly notificationsQueue: Queue,
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
   * Enviar notificação para usuário específico
   */
  async sendNotificationToUser(
    userId: number,
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      priority?: number;
      metadata?: any;
      actionUrl?: string;
      actionType?: string;
      actionData?: any;
      relatedJobId?: number;
      relatedApplicationId?: number;
      relatedUserId?: number;
      expiresAt?: Date;
    },
  ) {
    const createNotificationDto: CreateNotificationDto = {
      type,
      title,
      message,
      userId,
      priority: options?.priority || 1,
      metadata: options?.metadata,
      actionUrl: options?.actionUrl,
      actionType: options?.actionType,
      actionData: options?.actionData,
      relatedJobId: options?.relatedJobId,
      relatedApplicationId: options?.relatedApplicationId,
      relatedUserId: options?.relatedUserId,
      expiresAt: options?.expiresAt?.toISOString(),
    };

    return this.createNotification(createNotificationDto);
  }

  /**
   * Enviar notificação para todos os usuários de um papel específico
   */
  async sendNotificationToRole(
    role: Role,
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      priority?: number;
      metadata?: any;
      actionUrl?: string;
      actionType?: string;
      actionData?: any;
      relatedJobId?: number;
      expiresAt?: Date;
    },
  ) {
    // Buscar todos os usuários do papel especificado
    const users = await this.prisma.user.findMany({
      where: { role },
      select: { id: true },
    });

    const notifications = users.map((user) => ({
      type,
      title,
      message,
      userId: user.id,
      priority: options?.priority || 1,
      metadata: { ...options?.metadata, role },
      actionUrl: options?.actionUrl,
      actionType: options?.actionType,
      actionData: options?.actionData,
      relatedJobId: options?.relatedJobId,
      expiresAt: options?.expiresAt?.toISOString(),
    }));

    // Enviar todas as notificações em paralelo
    const results = await Promise.all(
      notifications.map((notification) =>
        this.createNotification(notification),
      ),
    );

    this.logger.log(
      `Sent ${results.length} notifications to users with role: ${role}`,
    );

    return {
      success: true,
      message: `Sent ${results.length} notifications to role: ${role}`,
      count: results.length,
      results,
    };
  }

  /**
   * Broadcast notificação para todos os usuários
   */
  async broadcastNotification(
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      priority?: number;
      metadata?: any;
      actionUrl?: string;
      actionType?: string;
      actionData?: any;
      relatedJobId?: number;
      expiresAt?: Date;
    },
  ) {
    // Buscar todos os usuários ativos
    const users = await this.prisma.user.findMany({
      select: { id: true },
    });

    const notifications = users.map((user) => ({
      type,
      title,
      message,
      userId: user.id,
      priority: options?.priority || 1,
      metadata: { ...options?.metadata, broadcast: true },
      actionUrl: options?.actionUrl,
      actionType: options?.actionType,
      actionData: options?.actionData,
      relatedJobId: options?.relatedJobId,
      expiresAt: options?.expiresAt?.toISOString(),
    }));

    // Enviar todas as notificações em paralelo
    const results = await Promise.all(
      notifications.map((notification) =>
        this.createNotification(notification),
      ),
    );

    this.logger.log(`Broadcasted ${results.length} notifications to all users`);

    return {
      success: true,
      message: `Broadcasted ${results.length} notifications to all users`,
      count: results.length,
      results,
    };
  }

  /**
   * Métodos específicos para tipos de notificação comuns
   */

  /**
   * Notificação de nova candidatura
   */
  async notifyNewJobApplication(
    enterpriseUserId: number,
    studentUserId: number,
    jobId: number,
    applicationId: number,
    studentName: string,
    jobTitle: string,
  ) {
    return this.sendNotificationToUser(
      enterpriseUserId,
      NotificationType.job_application_received,
      'Nova candidatura recebida',
      `${studentName} se candidatou para a vaga "${jobTitle}"`,
      {
        priority: 2,
        relatedJobId: jobId,
        relatedApplicationId: applicationId,
        relatedUserId: studentUserId,
        actionUrl: `/enterprise/applications/${applicationId}`,
        actionType: 'view_application',
        actionData: { applicationId, jobId, studentUserId },
      },
    );
  }

  /**
   * Notificação de candidatura aprovada
   */
  async notifyApplicationApproved(
    studentUserId: number,
    enterpriseUserId: number,
    jobId: number,
    applicationId: number,
    jobTitle: string,
    enterpriseName: string,
  ) {
    return this.sendNotificationToUser(
      studentUserId,
      NotificationType.job_application_updated,
      'Candidatura aprovada!',
      `Parabéns! Sua candidatura para "${jobTitle}" na ${enterpriseName} foi aprovada`,
      {
        priority: 3,
        relatedJobId: jobId,
        relatedApplicationId: applicationId,
        relatedUserId: enterpriseUserId,
        actionUrl: `/student/applications/${applicationId}`,
        actionType: 'view_approved_application',
        actionData: { applicationId, jobId, enterpriseUserId },
      },
    );
  }

  /**
   * Notificação de candidatura rejeitada
   */
  async notifyApplicationRejected(
    studentUserId: number,
    enterpriseUserId: number,
    jobId: number,
    applicationId: number,
    jobTitle: string,
    enterpriseName: string,
  ) {
    return this.sendNotificationToUser(
      studentUserId,
      NotificationType.job_application_updated,
      'Candidatura não aprovada',
      `Sua candidatura para "${jobTitle}" na ${enterpriseName} não foi aprovada desta vez`,
      {
        priority: 2,
        relatedJobId: jobId,
        relatedApplicationId: applicationId,
        relatedUserId: enterpriseUserId,
        actionUrl: `/student/applications/${applicationId}`,
        actionType: 'view_rejected_application',
        actionData: { applicationId, jobId, enterpriseUserId },
      },
    );
  }

  /**
   * Notificação de nova vaga publicada (para estudantes)
   */
  async notifyNewJobPosted(
    jobId: number,
    jobTitle: string,
    enterpriseName: string,
    jobLocation?: string,
  ) {
    return this.sendNotificationToRole(
      Role.student,
      NotificationType.job_published,
      'Nova vaga disponível!',
      `Nova vaga "${jobTitle}" publicada pela ${enterpriseName}${
        jobLocation ? ` em ${jobLocation}` : ''
      }`,
      {
        priority: 1,
        relatedJobId: jobId,
        actionUrl: `/jobs/${jobId}`,
        actionType: 'view_job',
        actionData: { jobId },
      },
    );
  }

  /**
   * Notificação de perfil curtido
   */
  async notifyProfileLiked(
    receiverUserId: number,
    likerUserId: number,
    likerName: string,
  ) {
    return this.sendNotificationToUser(
      receiverUserId,
      NotificationType.profile_liked,
      'Alguém curtiu seu perfil!',
      `${likerName} curtiu seu perfil`,
      {
        priority: 1,
        relatedUserId: likerUserId,
        actionUrl: `/users/${likerUserId}`,
        actionType: 'view_profile',
        actionData: { userId: likerUserId },
      },
    );
  }

  /**
   * Notificação de boas-vindas
   */
  async notifyWelcome(userId: number, userName: string) {
    return this.sendNotificationToUser(
      userId,
      NotificationType.welcome_message,
      'Bem-vindo à plataforma!',
      `Olá ${userName}, seja bem-vindo à nossa plataforma de talentos!`,
      {
        priority: 1,
        actionUrl: '/profile/setup',
        actionType: 'setup_profile',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      },
    );
  }

  /**
   * Notificação de manutenção do sistema
   */
  async notifySystemMaintenance(
    scheduledDate: Date,
    duration: string,
    description?: string,
  ) {
    return this.broadcastNotification(
      NotificationType.system_announcement,
      'Manutenção programada',
      `Manutenção do sistema agendada para ${scheduledDate.toLocaleDateString()} com duração de ${duration}${
        description ? `. ${description}` : ''
      }`,
      {
        priority: 3,
        metadata: {
          scheduledDate: scheduledDate.toISOString(),
          duration,
          description,
        },
        expiresAt: new Date(scheduledDate.getTime() + 24 * 60 * 60 * 1000), // Expira 24h após a manutenção
      },
    );
  }

  /**
   * Remover notificações lidas antigas automaticamente
   * Este método é executado via schedule para limpar o banco de dados
   */
  async cleanupOldReadNotifications(daysOld: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await this.prisma.notification.deleteMany({
        where: {
          isRead: true,
          readAt: {
            lt: cutoffDate,
          },
        },
      });

      this.logger.log(
        `Limpeza automática: ${result.count} notificações lidas antigas foram removidas (mais de ${daysOld} dias)`,
      );

      return;
    } catch (error) {
      this.logger.error(
        'Erro durante a limpeza automática de notificações antigas:',
        error,
      );
      throw error;
    }
  }

  /**
   * Remover notificações expiradas automaticamente
   * Remove notificações que passaram da data de expiração
   */
  async cleanupExpiredNotifications(): Promise<void> {
    try {
      const now = new Date();

      const result = await this.prisma.notification.deleteMany({
        where: {
          expiresAt: {
            lt: now,
          },
        },
      });

      this.logger.log(
        `Limpeza de expiração: ${result.count} notificações expiradas foram removidas`,
      );

      return;
    } catch (error) {
      this.logger.error(
        'Erro durante a limpeza de notificações expiradas:',
        error,
      );
      throw error;
    }
  }

  /**
   * Limpeza geral de notificações
   * Combina limpeza de notificações lidas antigas e expiradas
   */
  async performScheduledCleanup(): Promise<void> {
    this.logger.log('Iniciando limpeza agendada de notificações...');

    try {
      // Limpar notificações lidas com mais de 30 dias
      await this.cleanupOldReadNotifications(30);

      // Limpar notificações expiradas
      await this.cleanupExpiredNotifications();

      this.logger.log('Limpeza agendada de notificações concluída com sucesso');
    } catch (error) {
      this.logger.error(
        'Erro durante a limpeza agendada de notificações:',
        error,
      );
    }
  }
}
