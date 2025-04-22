import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { SocialMediaType } from 'src/common/enums/social.enum';

export class CreateTagDto {
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
