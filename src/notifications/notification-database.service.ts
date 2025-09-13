import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType, Notification, Prisma } from '@prisma/client';

export interface NotificationFilter {
  userId?: number;
  type?: NotificationType;
  isRead?: boolean;
  priority?: number;
  fromDate?: Date;
  toDate?: Date;
  relatedJobId?: number;
  relatedApplicationId?: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: 'createdAt' | 'priority' | 'updatedAt';
  orderDirection?: 'asc' | 'desc';
}

export interface NotificationWithRelations extends Notification {
  relatedUser?: {
    id: number;
    name: string | null;
    avatar: any;
  } | null;
  relatedJob?: {
    id: number;
    uuid: string;
    title: string;
    enterprise: {
      user: {
        name: string | null;
      };
    };
  } | null;
  relatedApplication?: {
    id: number;
    uuid: string;
    student: {
      user: {
        name: string | null;
      };
    };
  } | null;
}

@Injectable()
export class NotificationDatabaseService {
  private readonly logger = new Logger(NotificationDatabaseService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Buscar notificações de um usuário com filtros e paginação
   */
  async getUserNotifications(
    userId: number,
    filters: NotificationFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<{
    notifications: NotificationWithRelations[];
    total: number;
    unreadCount: number;
    hasMore: boolean;
  }> {
    const {
      page = 1,
      limit = 20,
      orderBy = 'createdAt',
      orderDirection = 'desc',
    } = pagination;

    const skip = (page - 1) * limit;

    // Construir filtros WHERE
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...this.buildWhereClause(filters),
    };

    // Buscar notificações com relações
    const notifications = await this.prisma.notification.findMany({
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
      orderBy: {
        [orderBy]: orderDirection,
      },
      skip,
      take: limit,
    });

    // Contar total e não lidas
    const [total, unreadCount] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    const hasMore = skip + notifications.length < total;

    return {
      notifications,
      total,
      unreadCount,
      hasMore,
    };
  }

  /**
   * Marcar notificação como lida
   */
  async markAsRead(
    notificationId: number,
    userId: number,
  ): Promise<Notification | null> {
    try {
      const notification = await this.prisma.notification.update({
        where: {
          id: notificationId,
          userId, // Garantir que só o dono pode marcar
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      this.logger.log(
        `Notification ${notificationId} marked as read by user ${userId}`,
      );

      return notification;
    } catch (error) {
      this.logger.error(
        `Failed to mark notification ${notificationId} as read:`,
        error,
      );
      return null;
    }
  }

  /**
   * Marcar múltiplas notificações como lidas
   */
  async markMultipleAsRead(
    notificationIds: number[],
    userId: number,
  ): Promise<number> {
    try {
      const result = await this.prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      this.logger.log(
        `${result.count} notifications marked as read by user ${userId}`,
      );

      return result.count;
    } catch (error) {
      this.logger.error(
        'Failed to mark multiple notifications as read:',
        error,
      );
      return 0;
    }
  }

  /**
   * Marcar todas as notificações de um usuário como lidas
   */
  async markAllAsRead(userId: number): Promise<number> {
    try {
      const result = await this.prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      this.logger.log(
        `All ${result.count} notifications marked as read by user ${userId}`,
      );

      return result.count;
    } catch (error) {
      this.logger.error('Failed to mark all notifications as read:', error);
      return 0;
    }
  }

  /**
   * Obter contagem de notificações não lidas
   */
  async getUnreadCount(userId: number): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  /**
   * Deletar notificação
   */
  async deleteNotification(
    notificationId: number,
    userId: number,
  ): Promise<boolean> {
    try {
      await this.prisma.notification.delete({
        where: {
          id: notificationId,
          userId, // Garantir que só o dono pode deletar
        },
      });

      this.logger.log(
        `Notification ${notificationId} deleted by user ${userId}`,
      );

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to delete notification ${notificationId}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Deletar notificações antigas expiradas
   */
  async cleanupExpiredNotifications(): Promise<number> {
    try {
      const result = await this.prisma.notification.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      this.logger.log(`Cleaned up ${result.count} expired notifications`);

      return result.count;
    } catch (error) {
      this.logger.error('Failed to cleanup expired notifications:', error);
      return 0;
    }
  }

  /**
   * Obter usuários que devem receber notificação de nova vaga
   * (estudantes ativos que não estão deletados)
   */
  async getUsersForJobNotification(excludeEnterpriseUserId?: number): Promise<
    {
      id: number;
      name: string | null;
      email: string;
    }[]
  > {
    return this.prisma.user.findMany({
      where: {
        role: 'student',
        isActive: true,
        isDeleted: false,
        isVerified: true,
        ...(excludeEnterpriseUserId && {
          id: { not: excludeEnterpriseUserId },
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  /**
   * Obter usuários por role para notificações em massa
   */
  async getUsersByRole(
    roles: string[],
    excludeUserIds: number[] = [],
  ): Promise<
    {
      id: number;
      name: string | null;
      email: string;
      role: string;
    }[]
  > {
    return this.prisma.user.findMany({
      where: {
        role: { in: roles as any[] },
        isActive: true,
        isDeleted: false,
        ...(excludeUserIds.length > 0 && {
          id: { notIn: excludeUserIds },
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }

  /**
   * Obter estatísticas de notificações de um usuário
   */
  async getUserNotificationStats(userId: number): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    recentCount: number; // Últimas 24h
  }> {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const [total, unread, byType, byPriority, recentCount] = await Promise.all([
      // Total
      this.prisma.notification.count({ where: { userId } }),

      // Não lidas
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),

      // Por tipo
      this.prisma.notification.groupBy({
        by: ['type'],
        where: { userId },
        _count: { type: true },
      }),

      // Por prioridade
      this.prisma.notification.groupBy({
        by: ['priority'],
        where: { userId },
        _count: { priority: true },
      }),

      // Recentes (24h)
      this.prisma.notification.count({
        where: {
          userId,
          createdAt: { gte: twentyFourHoursAgo },
        },
      }),
    ]);

    // Transformar resultados em objetos mais legíveis
    const byTypeMap = byType.reduce(
      (acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byPriorityMap = byPriority.reduce(
      (acc, item) => {
        acc[item.priority.toString()] = item._count.priority;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total,
      unread,
      byType: byTypeMap,
      byPriority: byPriorityMap,
      recentCount,
    };
  }

  /**
   * Construir cláusula WHERE baseada nos filtros
   */
  private buildWhereClause(
    filters: NotificationFilter,
  ): Prisma.NotificationWhereInput {
    const where: Prisma.NotificationWhereInput = {};

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.isRead !== undefined) {
      where.isRead = filters.isRead;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.relatedJobId) {
      where.relatedJobId = filters.relatedJobId;
    }

    if (filters.relatedApplicationId) {
      where.relatedApplicationId = filters.relatedApplicationId;
    }

    if (filters.fromDate || filters.toDate) {
      where.createdAt = {};
      if (filters.fromDate) {
        where.createdAt.gte = filters.fromDate;
      }
      if (filters.toDate) {
        where.createdAt.lte = filters.toDate;
      }
    }

    return where;
  }

  /**
   * Busca usuários conectados à empresa (que deram ou receberam likes)
   * para notificações de novas vagas
   */
  async getUsersConnectedToEnterprise(
    enterpriseUserId: number,
  ): Promise<Array<{ id: number; uuid: string; name: string | null }>> {
    try {
      this.logger.log(
        `Buscando usuários conectados à empresa ${enterpriseUserId}`,
      );

      // Buscar usuários que deram like para a empresa OU receberam like da empresa
      const connectedUsers = await this.prisma.user.findMany({
        where: {
          OR: [
            // Usuários que deram like para a empresa
            {
              initiatedLikes: {
                some: {
                  receiverId: enterpriseUserId,
                },
              },
            },
            // Usuários que receberam like da empresa
            {
              receivedLikes: {
                some: {
                  initiatorId: enterpriseUserId,
                },
              },
            },
          ],
          // Apenas estudantes devem receber notificações de vagas
          role: 'student',
        },
        select: {
          id: true,
          uuid: true,
          name: true,
        },
        distinct: ['id'],
      });

      this.logger.log(
        `Encontrados ${connectedUsers.length} usuários conectados à empresa`,
      );

      return connectedUsers;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar usuários conectados à empresa: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
