import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'The unique UUID of the user',
  })
  uuid: string;

  @ApiProperty({
    type: String,
    example: 'john_doe',
    description: 'The username of the user',
  })
  username: string;

  @ApiProperty({
    type: String,
    example: 'john@email.com',
    description: 'The email of the user',
  })
  email: string;

  @ApiProperty({
    type: String,
    example: 'student',
    description: 'The role of the user',
  })
  role: string;

  @ApiProperty({
    type: String,
    example: 'John Doe',
    description: 'The name of the user',
    required: false,
  })
  name?: string;

  @ApiProperty({
    type: String,
    example: 'Software developer passionate about technology',
    description: 'The description of the user',
    required: false,
  })
  description?: string;

  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'Whether the user is verified',
  })
  isVerified: boolean;

  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'Whether the user is active',
  })
  isActive: boolean;

  @ApiProperty({
    type: Boolean,
    example: false,
    description: 'Whether the user profile is complete',
  })
  isComplete: boolean;

  @ApiProperty({
    type: String,
    example: '2023-01-01T00:00:00.000Z',
    description: 'The creation date of the user',
  })
  createdAt: string;

  @ApiProperty({
    type: String,
    example: '2023-01-01T00:00:00.000Z',
    description: 'The last update date of the user',
  })
  updatedAt: string;
}

export class AccessTokenDto {
  @ApiProperty({
    type: String,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'The JWT access token',
  })
  access_token: string;

  @ApiProperty({
    type: String,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'The JWT refresh token',
  })
  refresh_token: string;

  @ApiProperty({
    type: Number,
    example: 3600,
    description: 'Access token expiration time in seconds',
  })
  access_token_expires_in: number;

  @ApiProperty({
    type: Number,
    example: 604800,
    description: 'Refresh token expiration time in seconds',
  })
  refresh_token_expires_in: number;

  @ApiProperty({
    type: UserResponseDto,
    description: 'The user information',
  })
  user: UserResponseDto;
}
