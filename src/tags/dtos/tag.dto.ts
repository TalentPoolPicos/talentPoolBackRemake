import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsString } from 'class-validator';
import { SocialMediaType } from 'src/common/enums/social.enum';

export class TagDto {
  @ApiProperty({
    type: String,
    description: 'The uuid of the social media',
  })
  @IsString({ message: 'UUID must be a string' })
  uuid: string;

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

  @ApiProperty({
    type: String,
    example: 'nodejs',
    description: 'The label of the tag',
    maxLength: 20,
    minLength: 3,
    enum: SocialMediaType,
  })
  @IsString({ message: 'Label must be a string' })
  label: string;
}
