import { ApiProperty } from '@nestjs/swagger';
import { LikeDto } from './like.dto';

export class LikesPageDto {
  @ApiProperty({
    type: [LikeDto],
    description: 'The list of users',
  })
  likes: LikeDto[];

  @ApiProperty({
    type: Number,
    description: 'The total number of users',
  })
  total: number;
}
