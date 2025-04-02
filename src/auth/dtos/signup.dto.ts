import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    type: String,
    example: 'john',
    description: 'The username of the user',
  })
  @IsString({ message: 'Username must be a string' })
  @MinLength(4, { message: 'Username must be at least 4 characters long' })
  username: string;

  @ApiProperty({
    type: String,
    example: 'john@email.com',
    description: 'The email of the user',
  })
  @IsString({ message: 'Email must be a string' })
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String,
    example: 'StrongP@ssword1!',
    description: 'The password of the user (must be strong)',
  })
  @IsStrongPassword(
    {},
    {
      message:
        'Password must be strong (include uppercase, lowercase, numbers, and symbols)',
    },
  )
  password: string;
}
