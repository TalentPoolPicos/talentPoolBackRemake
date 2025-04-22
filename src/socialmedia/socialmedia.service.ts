import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SocialMediaType } from 'src/common/enums/social.enum';
import { SocialMedia } from 'src/entities/socialmedia.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SocialmediaService {
  constructor(
    @InjectRepository(SocialMedia)
    private readonly socialMediaRepository: Repository<SocialMedia>,
  ) {}

  async findAllByUserId(userId: number): Promise<SocialMedia[]> {
    return this.socialMediaRepository.find({
      where: { user: { id: userId } },
      cache: true,
    });
  }

  async findAllByUserUuid(uuid: string): Promise<SocialMedia[]> {
    return this.socialMediaRepository.find({
      where: { user: { uuid } },
      cache: true,
    });
  }

  async exists(
    userId: number,
    type: SocialMediaType,
  ): Promise<SocialMedia | null> {
    return this.socialMediaRepository.findOne({
      where: { user: { id: userId }, type },
      cache: true,
    });
  }

  async add(
    userId: number,
    socialMedi: {
      type: SocialMediaType;
      url: string;
    },
  ): Promise<SocialMedia> {
    const existingSocialMedia = await this.exists(userId, socialMedi.type);

    if (existingSocialMedia) {
      existingSocialMedia.url = socialMedi.url;
      existingSocialMedia.updatedAt = new Date();
      return this.socialMediaRepository.save(existingSocialMedia);
    }

    const socialMedia = this.socialMediaRepository.create({
      type: socialMedi.type,
      url: socialMedi.url,
      user: { id: userId },
    });
    return this.socialMediaRepository.save(socialMedia);
  }

  async delete(uuid: string): Promise<SocialMedia> {
    const socialMedia = await this.socialMediaRepository.findOne({
      where: { uuid },
      cache: true,
    });
    if (!socialMedia)
      throw new NotFoundException('The social media could not be found');

    return this.socialMediaRepository.remove(socialMedia);
  }
}
