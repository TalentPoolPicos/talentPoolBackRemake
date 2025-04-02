import { ApiProperty } from '@nestjs/swagger';
import { IsJWT } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    type: String,
    description: 'The refresh token of the user',
  })
  @IsJWT()
  refreshToken: string;
}
