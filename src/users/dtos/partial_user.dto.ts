import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class PartialUserDto {
  @ApiProperty({
    type: String,
    required: false,
    example: 'john',
    description: 'The username of the user',
  })
  @IsOptional()
  @IsString({ message: 'Username must be a string' })
  username?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'john@john.com',
    description: 'The email of the user',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  // A atualização do password não deveria ser feita por aqui,
  // mas sim por um endpoint específico e enviado para o email.
  // Entretanto, para fins de exemplo, vamos deixar aqui.
  @ApiProperty({
    type: String,
    required: false,
    example: 'StrongP@ssword1!',
    description: 'The password of the user (must be strong)',
  })
  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @IsStrongPassword()
  password?: string;
}
