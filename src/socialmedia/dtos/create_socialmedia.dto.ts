import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, Validate } from 'class-validator';
import { SocialMediaType } from 'src/common/enums/social.enum';

import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsSocialMediaTypeValid implements ValidatorConstraintInterface {
  constructor() {}

  validate(value: string) {
    return Object.values(SocialMediaType).some(
      (type) => type.toLowerCase() === value.toLowerCase(),
    );
  }

  defaultMessage() {
    return 'Type must be a valid social media type';
  }
}

export class CreateSocialMediaDto {
  @ApiProperty({
    type: String,
    example: 'instagram',
    description: 'The type of social media',
    enum: SocialMediaType,
  })
  @IsString({ message: 'Type must be a string' })
  @Validate(IsSocialMediaTypeValid)
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
