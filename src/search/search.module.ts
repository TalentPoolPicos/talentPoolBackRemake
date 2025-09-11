import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { SearchSchedulerService } from './search-scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    StorageModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [SearchController],
  providers: [SearchService, SearchSchedulerService],
  exports: [SearchService],
})
export class SearchModule {}
