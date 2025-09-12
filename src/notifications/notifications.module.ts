import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';
import { NotificationProcessor } from './notification.processor';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { NotificationDatabaseService } from './notification-database.service';
import { NotificationManagerService } from './notification-manager.service';
import { NotificationCleanupService } from './notification-cleanup.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NOTIFICATION_QUEUES } from './constants/queue.constants';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: NOTIFICATION_QUEUES.NOTIFICATIONS,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }),
  ],
  providers: [
    NotificationsService,
    NotificationProcessor,
    NotificationsGateway,
    NotificationDatabaseService,
    NotificationManagerService,
    NotificationCleanupService,
  ],
  exports: [
    NotificationsService,
    NotificationsGateway,
    NotificationDatabaseService,
    NotificationManagerService,
    NotificationCleanupService,
  ],
})
export class NotificationsModule {}
