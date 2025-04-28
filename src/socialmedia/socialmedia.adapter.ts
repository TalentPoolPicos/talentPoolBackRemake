import { SocialMedia } from 'src/entities/socialmedia.entity';
import { SocialMediaDto } from './dtos/socialmedia.dto';
import { SocialMediaType } from 'src/common/enums/social.enum';

export class SocialMediaAdapter {
  private static stringToSocialMediaType(type: string): SocialMediaType {
    switch (type) {
      case 'facebook':
        return SocialMediaType.facebook;
      case 'x':
        return SocialMediaType.x;
      case 'instagram':
        return SocialMediaType.instagram;
      case 'linkedin':
        return SocialMediaType.linkedin;
      case 'tiktok':
        return SocialMediaType.tiktok;
      case 'youtube':
        return SocialMediaType.youtube;
      case 'discord':
        return SocialMediaType.discord;
      case 'github':
        return SocialMediaType.github;
      case 'gitlab':
        return SocialMediaType.gitlab;
      case 'reddit':
        return SocialMediaType.reddit;
      case 'telegram':
        return SocialMediaType.telegram;
      case 'whatsapp':
        return SocialMediaType.whatsapp;
      default:
        throw new Error(`Unknown social media type: ${type}`);
    }
  }

  /**
   * Converts a SocialMedia entity to a SocialMediaDto.
   * @param socialMedia - The SocialMedia entity to convert.
   * @returns The converted SocialMediaDto.
   */
  static entityToDto(socialMedia: SocialMedia): SocialMediaDto {
    return {
      uuid: socialMedia.uuid,
      created_at: socialMedia.createdAt,
      updated_at: socialMedia.updatedAt,
      type: this.stringToSocialMediaType(socialMedia.type),
      url: socialMedia.url,
    };
  }
}
