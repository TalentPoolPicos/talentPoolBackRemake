import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { SearchModule } from '../search/search.module';
import { UsersService } from './users.service';
import { UserImageService } from './user-image.service';
import { UsersController } from './users.controller';
import { MeController } from './me.controller';
import { LikesService } from '../likes/likes.service';

@Module({
  imports: [PrismaModule, StorageModule, forwardRef(() => SearchModule)],
  controllers: [UsersController, MeController],
  providers: [UsersService, UserImageService, LikesService],
  exports: [UsersService, UserImageService],
})
export class UsersModule {}
