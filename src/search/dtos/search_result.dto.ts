import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from 'src/dtos/user.dto';

export class SearchResultDto {
  @ApiProperty({
    type: UserDto,
    description: 'The list of users found by the search query',
  })
  users: UserDto[];

  @ApiProperty({
    type: Number,
    description: 'The total number of users found by the search query',
  })
  total: number;
}
