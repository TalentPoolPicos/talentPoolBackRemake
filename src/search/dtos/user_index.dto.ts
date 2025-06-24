import { ApiProperty } from '@nestjs/swagger';

export class UserIndexDto {
  @ApiProperty({
    type: String,
    example: 'john',
    description: 'The username of the user',
  })
  username?: string;

  @ApiProperty({
    type: String,
    description: 'The tags of the user',
  })
  tags?: string;

  @ApiProperty({
    type: String,
    description: 'The name of the student',
    required: false,
  })
  name?: string;

  @ApiProperty({
    type: String,
    description: 'The email of the student',
    required: false,
  })
  email?: string;

  @ApiProperty({
    type: String,
    description: 'The description of the student',
    required: false,
  })
  description?: string;
}
