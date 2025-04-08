import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';
import { SocialMediaType } from 'src/common/enums/social.enum';

export class CreateSocialMediaDto {
  @ApiProperty({
    type: String,
    example: 'instagram',
    description: 'The type of social media',
    enum: SocialMediaType,
  })
  type: SocialMediaType;

  @ApiProperty({
    type: String,
    example: 'https://instagram.com/john',
    description: 'The URL of the social media',
  })
  @IsString({ message: 'URL must be a string' })
  @IsUrl({}, { message: 'URL must be a valid URL' })
  url: string;
}
