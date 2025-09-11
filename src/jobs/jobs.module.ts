import { Module, forwardRef } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [PrismaModule, StorageModule, forwardRef(() => SearchModule)],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
