import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsStrongPassword, MinLength } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    type: String,
    example: 'joao_silva',
    description: 'O nome de usuário',
  })
  @IsString({ message: 'Nome de usuário deve ser uma string' })
  @MinLength(3, { message: 'Nome de usuário deve ter pelo menos 3 caracteres' })
  username: string;

  @ApiProperty({
    type: String,
    example: 'MinhaSenh@123',
    description: 'A senha do usuário (deve ser forte)',
  })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Senha deve ter pelo menos 8 caracteres e conter pelo menos uma letra maiúscula, uma minúscula, um número e um símbolo',
    },
  )
  password: string;
}
