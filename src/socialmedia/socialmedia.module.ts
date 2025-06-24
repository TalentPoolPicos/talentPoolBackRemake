import { Module } from '@nestjs/common';
import { SocialmediaController } from './socialmedia.controller';
import { SocialmediaService } from './socialmedia.service';
import { SocialMedia } from 'src/entities/socialmedia.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([SocialMedia])],
  controllers: [SocialmediaController],
  providers: [SocialmediaService],
  exports: [SocialmediaService],
})
export class SocialmediaModule {}
