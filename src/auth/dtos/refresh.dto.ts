import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    type: String,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'O token de renovação para obter um novo token de acesso',
  })
  @IsString({ message: 'Token de renovação deve ser uma string' })
  @IsNotEmpty({ message: 'Token de renovação não pode estar vazio' })
  refreshToken: string;
}
