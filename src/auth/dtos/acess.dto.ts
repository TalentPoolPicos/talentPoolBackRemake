import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsPositive } from 'class-validator';
import { UserDto } from 'src/dtos/user.dto';

export class AccessTokenDto {
  @ApiProperty({
    type: String,
    description: 'The access token of the user',
  })
  @IsJWT()
  access_token: string;

  @ApiProperty({
    type: String,
    description: 'The refresh token of the user',
  })
  @IsJWT()
  refresh_token: string;

  @ApiProperty({
    type: Number,
    description: 'The access token expiration time in seconds',
  })
  @IsPositive()
  access_token_expires_in: number;

  @ApiProperty({
    type: Number,
    description: 'The refresh token expiration time in seconds',
  })
  @IsPositive()
  refresh_token_expires_in: number;

  @ApiProperty({
    type: UserDto,
    description: 'The user information',
  })
  user: UserDto;
}
