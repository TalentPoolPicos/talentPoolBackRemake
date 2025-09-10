import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenDto {
  @ApiProperty({
    type: String,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT de acesso (válido por 1 hora)',
  })
  access_token: string;

  @ApiProperty({
    type: String,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT de renovação (válido por 7 dias)',
  })
  refresh_token: string;

  @ApiProperty({
    type: Number,
    example: 3600,
    description: 'Tempo de expiração do token de acesso em segundos',
  })
  access_token_expires_in: number;

  @ApiProperty({
    type: Number,
    example: 604800,
    description: 'Tempo de expiração do token de renovação em segundos',
  })
  refresh_token_expires_in: number;
}
