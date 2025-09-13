import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { SearchModule } from '../search/search.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { NOTIFICATION_QUEUES } from '../notifications/constants/queue.constants';

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    forwardRef(() => SearchModule),
    forwardRef(() => NotificationsModule),
    BullModule.registerQueue({
      name: NOTIFICATION_QUEUES.JOB_NOTIFICATIONS,
    }),
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
