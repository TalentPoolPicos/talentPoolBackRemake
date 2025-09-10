import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsStrongPassword,
  MinLength,
  IsOptional,
  ValidateBy,
  ValidationOptions,
} from 'class-validator';
import {
  isInstitutionalEmail,
  INSTITUTIONAL_EMAIL_DOMAINS,
} from '../constants/institutional-emails';

/**
 * Custom validator for institutional email
 */
export function IsInstitutionalEmail(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isInstitutionalEmail',
      validator: {
        validate: (value: string) => isInstitutionalEmail(value),
        defaultMessage: () => {
          const domains = INSTITUTIONAL_EMAIL_DOMAINS.join(', ');
          return `Email deve ser de um domínio institucional. Domínios válidos: ${domains}`;
        },
      },
    },
    validationOptions,
  );
}

export class SignUpDto {
  @ApiProperty({
    type: String,
    example: 'john_doe',
    description: 'The username of the user',
  })
  @IsString({ message: 'Nome de usuário deve ser uma string' })
  @MinLength(3, { message: 'Nome de usuário deve ter pelo menos 3 caracteres' })
  username: string;

  @ApiProperty({
    type: String,
    example: 'joao.silva@ufpi.edu.br',
    description:
      'O email institucional do estudante (deve ser de uma instituição educacional válida)',
  })
  @IsString({ message: 'Email deve ser uma string' })
  @IsEmail({}, { message: 'Email deve ser um endereço de email válido' })
  @IsInstitutionalEmail()
  email: string;

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

  @ApiProperty({
    type: String,
    example: 'João Silva',
    description: 'O nome completo do usuário',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  name?: string;

  @ApiProperty({
    type: String,
    example: 'Desenvolvedor de software apaixonado por tecnologia',
    description: 'Uma breve descrição sobre o usuário',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  description?: string;
}
