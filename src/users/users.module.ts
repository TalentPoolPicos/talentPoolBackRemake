import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MeController } from './me.controller';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [UsersController, MeController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
