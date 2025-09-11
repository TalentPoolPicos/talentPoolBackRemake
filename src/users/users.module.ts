import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { SearchModule } from '../search/search.module';
import { JobsModule } from '../jobs/jobs.module';
import { UsersService } from './users.service';
import { UserImageService } from './user-image.service';
import { UsersController } from './users.controller';
import { MeController } from './me.controller';
import { LikesService } from '../likes/likes.service';
import { JobsService } from '../jobs/jobs.service';

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    forwardRef(() => SearchModule),
    forwardRef(() => JobsModule),
  ],
  controllers: [UsersController, MeController],
  providers: [UsersService, UserImageService, LikesService, JobsService],
  exports: [UsersService, UserImageService],
})
export class UsersModule {}
