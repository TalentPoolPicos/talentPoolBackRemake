import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsUrl } from 'class-validator';
import { Role } from 'src/common/enums/roles.enum';
import { SocialMediaDto } from 'src/socialmedia/dtos/socialmedia.dto';

export class UserDto {
  @ApiProperty({
    type: String,
    description: 'The uuid of the user',
  })
  @IsString({ message: 'UUID must be a string' })
  uuid: string;

  @ApiProperty({
    type: String,
    example: 'john',
    description: 'The username of the user',
  })
  @IsString({ message: 'Username must be a string' })
  username: string;

  @ApiProperty({
    type: String,
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @ApiProperty({
    type: String,
    description: 'The role of the user',
    enum: Role,
  })
  role: Role;

  @ApiProperty({
    type: String,
    required: false,
    description: 'The profile picture of the user',
  })
  @IsUrl({}, { message: 'Profile picture must be a valid URL' })
  profilePicture?: string;

  @ApiProperty({
    type: Date,
    description: 'The date the user was created',
  })
  created_at: Date;

  @ApiProperty({
    type: Date,
    description: 'The date the user was last updated',
  })
  updated_at: Date;

  @ApiProperty({
    type: [String],
    description: 'The social media of the user',
  })
  @IsString({ each: true, message: 'Social media must be a string' })
  socialMedia: SocialMediaDto[];
}
