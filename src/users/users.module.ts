import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Student } from 'src/entities/student.entity';
import { SocialMedia } from 'src/entities/socialmedia.entity';
import { Tag } from 'src/entities/tag.entity';
import { Enterprise } from 'src/entities/enterprise.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Student, SocialMedia, Tag, Enterprise]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
