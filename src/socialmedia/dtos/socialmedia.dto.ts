import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsString, IsUrl } from 'class-validator';
import { SocialMediaType } from 'src/common/enums/social.enum';

export class SocialMediaDto {
  @ApiProperty({
    type: String,
    description: 'The uuid of the social media',
  })
  @IsString({ message: 'UUID must be a string' })
  uuid: string;

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

  @ApiProperty({
    type: Date,
    description: 'The date the social media was created',
  })
  @IsDate({ message: 'Created at must be a date' })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'The date the social media was last updated',
  })
  @IsDate({ message: 'Updated at must be a date' })
  updatedAt: Date;
}
