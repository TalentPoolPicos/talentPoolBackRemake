import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationCleanupService {
  private readonly logger = new Logger(NotificationCleanupService.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Schedule para limpeza diária de notificações
   * Executa todos os dias às 2:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleDailyCleanup() {
    this.logger.log('Executando limpeza diária de notificações...');

    try {
      await this.notificationsService.performScheduledCleanup();
      this.logger.log('Limpeza diária de notificações concluída');
    } catch (error) {
      this.logger.error(
        'Erro durante a limpeza diária de notificações:',
        error,
      );
    }
  }

  /**
   * Schedule para limpeza de notificações expiradas
   * Executa a cada 6 horas
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async handleExpiredNotificationsCleanup() {
    this.logger.log('Executando limpeza de notificações expiradas...');

    try {
      await this.notificationsService.cleanupExpiredNotifications();
      this.logger.log('Limpeza de notificações expiradas concluída');
    } catch (error) {
      this.logger.error(
        'Erro durante a limpeza de notificações expiradas:',
        error,
      );
    }
  }

  /**
   * Schedule para limpeza semanal intensiva
   * Executa todos os domingos às 3:00 AM
   * Remove notificações lidas com mais de 7 dias
   */
  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklyIntensiveCleanup() {
    this.logger.log('Executando limpeza semanal intensiva de notificações...');

    try {
      // Limpeza mais agressiva para notificações lidas há mais de 7 dias
      await this.notificationsService.cleanupOldReadNotifications(7);
      this.logger.log('Limpeza semanal intensiva concluída');
    } catch (error) {
      this.logger.error('Erro durante a limpeza semanal intensiva:', error);
    }
  }

  /**
   * Método manual para limpeza (pode ser chamado via endpoint administrativo)
   */
  async manualCleanup(daysOld?: number): Promise<{
    oldReadNotifications: number;
    expiredNotifications: number;
    message: string;
  }> {
    this.logger.log('Executando limpeza manual de notificações...');

    try {
      // Contar notificações antes da limpeza
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - (daysOld || 30));

      const oldReadCount = await this.countOldReadNotifications(cutoffDate);
      const expiredCount = await this.countExpiredNotifications();

      // Executar limpeza
      if (daysOld) {
        await this.notificationsService.cleanupOldReadNotifications(daysOld);
      } else {
        await this.notificationsService.performScheduledCleanup();
      }

      const message = `Limpeza manual concluída: ${oldReadCount} notificações lidas antigas e ${expiredCount} notificações expiradas foram removidas`;
      this.logger.log(message);

      return {
        oldReadNotifications: oldReadCount,
        expiredNotifications: expiredCount,
        message,
      };
    } catch (error) {
      this.logger.error('Erro durante a limpeza manual:', error);
      throw error;
    }
  }

  /**
   * Contar notificações lidas antigas
   */
  private async countOldReadNotifications(cutoffDate: Date): Promise<number> {
    return this.prisma.notification.count({
      where: {
        isRead: true,
        readAt: {
          lt: cutoffDate,
        },
      },
    });
  }

  /**
   * Contar notificações expiradas
   */
  private async countExpiredNotifications(): Promise<number> {
    const now = new Date();
    return this.prisma.notification.count({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });
  }
}
