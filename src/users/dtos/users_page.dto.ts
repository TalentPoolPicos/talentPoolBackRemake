import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from 'src/dtos/user.dto';

export class UsersPageDto {
  @ApiProperty({
    type: UserDto,
    description: 'The list of users',
  })
  users: UserDto[];

  @ApiProperty({
    type: Number,
    description: 'The total number of users',
  })
  total: number;
}
