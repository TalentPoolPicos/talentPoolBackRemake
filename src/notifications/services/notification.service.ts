import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { NotificationsGateway } from '../gateways/notifications.gateway';
import {
  NOTIFICATION_QUEUES,
  NOTIFICATION_JOBS,
} from '../constants/queue.constants';

export interface CreateNotificationData {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: any;
  priority?: number;
  expiresAt?: Date;
  actionUrl?: string;
  actionType?: string;
  actionData?: any;
  relatedJobId?: number;
  relatedApplicationId?: number;
  relatedUserId?: number;
}

export interface NotificationResult {
  success: boolean;
  notificationId?: number;
  error?: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectQueue(NOTIFICATION_QUEUES.NOTIFICATIONS)
    private readonly notificationsQueue: Queue,
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Criar notificação de forma síncrona (para casos críticos)
   */
  async createNotificationSync(
    data: CreateNotificationData,
  ): Promise<NotificationResult> {
    try {
      this.logger.log(
        `Creating notification for user ${data.userId}: ${data.title}`,
      );
      const notification = await this.prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
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

      this.logger.log(`Notification created successfully: ${notification.id}`);

      // Enviar via WebSocket em tempo real
      this.notificationsGateway.sendNotificationToUser(
        data.userId,
        notification,
      );

      this.logger.log(
        `Notification created: ${notification.id} for user ${data.userId}`,
      );

      return {
        success: true,
        notificationId: notification.id,
      };
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Criar notificação de forma assíncrona (via queue)
   */
  async createNotificationAsync(data: CreateNotificationData): Promise<void> {
    try {
      await this.notificationsQueue.add(
        NOTIFICATION_JOBS.CREATE_NOTIFICATION,
        data,
        {
          priority: data.priority || 1,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      );

      this.logger.log(`Notification queued for user ${data.userId}`);
    } catch (error) {
      this.logger.error(`Failed to queue notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Notificar sobre atualização de status de candidatura
   */
  async notifyApplicationStatusUpdate(
    applicationId: number,
    newStatus: string,
    studentId: number,
    jobTitle: string,
    jobUuid?: string,
  ): Promise<void> {
    this.logger.log(
      `Notifying application status update: ${newStatus} for student ${studentId}`,
    );
    const statusMessages = {
      accepted: 'Parabéns! Sua candidatura foi aceita',
      rejected: 'Sua candidatura não foi selecionada desta vez',
      interview: 'Você foi selecionado para entrevista',
      pending: 'Sua candidatura está sendo analisada',
      reviewing: 'Sua candidatura está sendo revisada',
      approved: 'Sua candidatura foi aprovada',
      withdrawn: 'Sua candidatura foi retirada',
    };

    const message =
      statusMessages[newStatus] ||
      `Status da sua candidatura foi atualizado para: ${newStatus}`;

    const jobUrl = jobUuid
      ? `/jobs/${jobUuid}`
      : `/student/applications/${applicationId}`;

    this.logger.log(
      `Creating notification with data: ${JSON.stringify({
        userId: studentId,
        type: NotificationType.job_application_updated,
        title: 'Atualização de Candidatura',
        message: `${message} para a vaga "${jobTitle}"`,
        priority: newStatus === 'approved' ? 3 : 2,
        relatedApplicationId: applicationId,
        actionUrl: jobUrl,
        actionType: 'view_application',
        actionData: { applicationId, jobUuid },
      })}`,
    );

    await this.createNotificationSync({
      userId: studentId,
      type: NotificationType.job_application_updated,
      title: 'Atualização de Candidatura',
      message: `${message} para a vaga "${jobTitle}"`,
      priority: newStatus === 'approved' ? 3 : 2,
      relatedApplicationId: applicationId,
      actionUrl: jobUrl,
      actionType: 'view_application',
      actionData: { applicationId, jobUuid },
    });

    this.logger.log(
      `Notification created successfully for application status update`,
    );
  }

  /**
   * Notificar sobre nova candidatura em vaga
   */
  async notifyNewJobApplication(
    applicationId: number,
    jobId: number,
    enterpriseId: number,
    studentName: string,
    jobTitle: string,
  ): Promise<void> {
    await this.createNotificationSync({
      userId: enterpriseId,
      type: NotificationType.job_application_received,
      title: 'Nova Candidatura',
      message: `${studentName} se candidatou para a vaga "${jobTitle}"`,
      priority: 2,
      relatedApplicationId: applicationId,
      relatedJobId: jobId,
      actionUrl: `/enterprise/jobs/${jobId}/applications`,
      actionType: 'view_applications',
    });
  }

  /**
   * Notificar sobre publicação de vaga
   */
  async notifyJobPublished(
    jobId: number,
    jobTitle: string,
    enterpriseId: number,
    targetUserIds: number[],
  ): Promise<void> {
    const promises = targetUserIds.map((userId) =>
      this.createNotificationAsync({
        userId,
        type: NotificationType.job_published,
        title: 'Nova Vaga Publicada',
        message: `Nova vaga disponível: "${jobTitle}"`,
        priority: 1,
        relatedJobId: jobId,
        actionUrl: `/jobs/${jobId}`,
        actionType: 'view_job',
      }),
    );

    await Promise.all(promises);
  }

  /**
   * Notificar sobre like no perfil
   */
  async notifyProfileLiked(
    likedUserId: number,
    likerName: string,
    likerId: number,
  ): Promise<void> {
    await this.createNotificationSync({
      userId: likedUserId,
      type: NotificationType.profile_liked,
      title: 'Novo Like',
      message: `${likerName} curtiu seu perfil`,
      priority: 1,
      relatedUserId: likerId,
      actionUrl: `/profile/${likerId}`,
      actionType: 'view_profile',
    });
  }

  /**
   * Notificar sobre adição de notas do recrutador
   */
  async notifyReviewNotesAdded(
    applicationId: number,
    studentId: number,
    jobTitle: string,
    reviewerName: string,
  ): Promise<void> {
    await this.createNotificationSync({
      userId: studentId,
      type: NotificationType.review_notes_added,
      title: 'Notas do Recrutador',
      message: `${reviewerName} adicionou notas sobre sua candidatura para "${jobTitle}"`,
      priority: 2,
      relatedApplicationId: applicationId,
      actionUrl: `/student/applications/${applicationId}`,
      actionType: 'view_application',
    });
  }

  /**
   * Notificar sobre retirada de candidatura
   */
  async notifyApplicationWithdrawal(
    applicationId: number,
    enterpriseId: number,
    studentName: string,
    jobTitle: string,
    jobId: number,
  ): Promise<void> {
    await this.createNotificationSync({
      userId: enterpriseId,
      type: NotificationType.job_application_updated,
      title: 'Candidatura Retirada',
      message: `${studentName} retirou sua candidatura para a vaga "${jobTitle}"`,
      priority: 1,
      relatedApplicationId: applicationId,
      relatedJobId: jobId,
      actionUrl: `/enterprise/jobs/${jobId}/applications`,
      actionType: 'view_applications',
    });
  }

  /**
   * Notificar boas-vindas para novo usuário
   */
  async notifyWelcome(
    userId: number,
    userName: string,
    userRole: 'student' | 'enterprise',
  ): Promise<void> {
    const roleMessage =
      userRole === 'student'
        ? 'Explore vagas de emprego e conecte-se com empresas!'
        : 'Publique vagas e encontre talentos incríveis!';

    await this.createNotificationSync({
      userId,
      type: NotificationType.welcome_message,
      title: 'Bem-vindo ao Banco de Talentos!',
      message: `Olá ${userName}! ${roleMessage}`,
      priority: 1,
      actionUrl:
        userRole === 'student' ? '/student/dashboard' : '/enterprise/dashboard',
      actionType: 'view_dashboard',
    });
  }

  /**
   * Notificar sobre vaga publicada para estudantes relevantes
   * Notifica estudantes que deram like na empresa OU que a empresa deu like
   */
  async notifyJobPublishedToRelevantStudents(
    jobId: number,
    jobTitle: string,
    enterpriseId: number,
    enterpriseName: string,
  ): Promise<void> {
    try {
      // Buscar estudantes que deram like na empresa
      const studentsWhoLikedEnterprise = await this.prisma.like.findMany({
        where: {
          receiverId: enterpriseId,
          initiator: {
            role: 'student',
          },
        },
        include: {
          initiator: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      });

      // Buscar estudantes que a empresa deu like
      const studentsLikedByEnterprise = await this.prisma.like.findMany({
        where: {
          initiatorId: enterpriseId,
          receiver: {
            role: 'student',
          },
        },
        include: {
          receiver: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      });

      // Combinar e remover duplicatas
      const relevantStudents = new Map();

      studentsWhoLikedEnterprise.forEach((like) => {
        relevantStudents.set(like.initiator.id, {
          id: like.initiator.id,
          name: like.initiator.name,
          username: like.initiator.username,
        });
      });

      studentsLikedByEnterprise.forEach((like) => {
        relevantStudents.set(like.receiver.id, {
          id: like.receiver.id,
          name: like.receiver.name,
          username: like.receiver.username,
        });
      });

      // Enviar notificações para todos os estudantes relevantes
      const notifications = Array.from(relevantStudents.values()).map(
        (student) =>
          this.createNotificationAsync({
            userId: student.id,
            type: NotificationType.job_published,
            title: 'Nova Vaga Publicada',
            message: `${enterpriseName} publicou uma nova vaga: "${jobTitle}"`,
            priority: 2,
            relatedJobId: jobId,
            actionUrl: `/jobs/${jobId}`,
            actionType: 'view_job',
          }),
      );

      await Promise.all(notifications);

      this.logger.log(
        `Notificações de vaga publicada enviadas para ${relevantStudents.size} estudantes relevantes`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao notificar estudantes sobre vaga publicada: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Notificar sobre vaga expirando (para a empresa)
   */
  async notifyJobExpiring(
    jobId: number,
    jobTitle: string,
    enterpriseId: number,
    daysUntilExpiry: number,
  ): Promise<void> {
    await this.createNotificationSync({
      userId: enterpriseId,
      type: NotificationType.job_expiring,
      title: 'Vaga Expirando',
      message: `A vaga "${jobTitle}" expira em ${daysUntilExpiry} dias`,
      priority: 2,
      relatedJobId: jobId,
      actionUrl: `/enterprise/jobs/${jobId}`,
      actionType: 'view_job',
    });
  }

  /**
   * Notificar sobre visualização de perfil
   */
  async notifyProfileViewed(
    viewedUserId: number,
    viewerName: string,
    viewerId: number,
  ): Promise<void> {
    await this.createNotificationSync({
      userId: viewedUserId,
      type: NotificationType.profile_viewed,
      title: 'Perfil Visualizado',
      message: `${viewerName} visualizou seu perfil`,
      priority: 1,
      relatedUserId: viewerId,
      actionUrl: `/profile/${viewerId}`,
      actionType: 'view_profile',
    });
  }

  /**
   * Notificar sobre anúncio do sistema
   */
  async notifySystemAnnouncement(
    title: string,
    message: string,
    userIds?: number[],
  ): Promise<void> {
    if (userIds && userIds.length > 0) {
      // Notificar usuários específicos
      const notifications = userIds.map((userId) =>
        this.createNotificationAsync({
          userId,
          type: NotificationType.system_announcement,
          title,
          message,
          priority: 3,
          actionType: 'view_announcement',
        }),
      );
      await Promise.all(notifications);
    } else {
      // Notificar todos os usuários
      const allUsers = await this.prisma.user.findMany({
        select: { id: true },
      });

      const notifications = allUsers.map((user) =>
        this.createNotificationAsync({
          userId: user.id,
          type: NotificationType.system_announcement,
          title,
          message,
          priority: 3,
          actionType: 'view_announcement',
        }),
      );
      await Promise.all(notifications);
    }
  }

  /**
   * Obter notificações do usuário
   */
  async getUserNotifications(
    userId: number,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false,
  ) {
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        include: {
          relatedUser: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          relatedJob: {
            select: {
              id: true,
              uuid: true,
              title: true,
              enterprise: {
                select: {
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          relatedApplication: {
            select: {
              id: true,
              uuid: true,
              student: {
                select: {
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      notifications,
      total,
      unreadCount,
      hasMore: skip + notifications.length < total,
    };
  }

  /**
   * Marcar notificação como lida
   */
  async markAsRead(notificationId: number, userId: number): Promise<boolean> {
    try {
      const result = await this.prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId: userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return result.count > 0;
    } catch (error) {
      this.logger.error(
        `Failed to mark notification as read: ${error.message}`,
      );
      return false;
    }
  }

  /**
   * Marcar todas as notificações como lidas
   */
  async markAllAsRead(userId: number): Promise<number> {
    try {
      const result = await this.prisma.notification.updateMany({
        where: {
          userId: userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return result.count;
    } catch (error) {
      this.logger.error(
        `Failed to mark all notifications as read: ${error.message}`,
      );
      return 0;
    }
  }

  /**
   * Obter contagem de notificações não lidas
   */
  async getUnreadCount(userId: number): Promise<number> {
    try {
      return await this.prisma.notification.count({
        where: {
          userId: userId,
          isRead: false,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to get unread count: ${error.message}`);
      return 0;
    }
  }

  /**
   * Obter estatísticas de notificações do usuário
   */
  async getUserNotificationStats(userId: number) {
    try {
      const [total, unread, byType] = await Promise.all([
        this.prisma.notification.count({ where: { userId } }),
        this.prisma.notification.count({ where: { userId, isRead: false } }),
        this.prisma.notification.groupBy({
          by: ['type'],
          where: { userId },
          _count: { type: true },
        }),
      ]);

      return {
        total,
        unread,
        byType: byType.reduce((acc, item) => {
          acc[item.type] = item._count.type;
          return acc;
        }, {}),
      };
    } catch (error) {
      this.logger.error(`Failed to get notification stats: ${error.message}`);
      return {
        total: 0,
        unread: 0,
        byType: {},
      };
    }
  }

  /**
   * Método de teste para criar notificação diretamente
   */
  async testCreateNotification(
    userId: number,
    title: string,
    message: string,
  ): Promise<NotificationResult> {
    this.logger.log(`Testing notification creation for user ${userId}`);
    return this.createNotificationSync({
      userId,
      type: NotificationType.custom,
      title,
      message,
      priority: 1,
    });
  }
}
