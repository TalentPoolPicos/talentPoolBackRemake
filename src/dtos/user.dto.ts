import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';
import { AddressDto } from 'src/address/dtos/address.dto';
import { Role } from 'src/common/enums/roles.enum';
import { EnterpriseDto } from 'src/enterprise/dtos/enterprise.dto';
import { SocialMediaDto } from 'src/socialmedia/dtos/socialmedia.dto';
import { StudentDto } from 'src/students/dtos/student.dto';
import { TagDto } from 'src/tags/dtos/tag.dto';

export class UserDto {
  @ApiProperty({
    type: String,
    description: 'The uuid of the user',
  })
  @IsString({ message: 'UUID must be a string' })
  uuid: string;

  @ApiProperty({
    type: Date,
    description: 'The date the user was created',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'The date the user was last updated',
  })
  updatedAt: Date;

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
  profilePicture: string | null;

  @ApiProperty({
    type: String,
    required: false,
    description: 'The banner picture of the user',
  })
  @IsUrl({}, { message: 'Banner picture must be a valid URL' })
  bannerPicture: string | null;

  @ApiProperty({
    type: AddressDto,
    required: false,
    description: 'The address of the user',
    nullable: true,
  })
  address: AddressDto | null;

  @ApiProperty({
    type: [SocialMediaDto],
    description: 'The social media of the user',
  })
  @IsString({ each: true, message: 'Social media must be a string' })
  socialMedia: SocialMediaDto[];

  @ApiProperty({
    type: [TagDto],
    description: 'The tags of the user',
  })
  tags: TagDto[];

  @ApiProperty({
    type: StudentDto,
    description: 'The student of the user',
    required: false,
  })
  @IsOptional()
  student?: StudentDto;

  @ApiProperty({
    type: EnterpriseDto,
    required: false,
    description: 'The enterprise of the user',
  })
  @IsOptional()
  enterprise?: EnterpriseDto;
}
