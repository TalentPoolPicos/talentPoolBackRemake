import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class IsLikeDto {
  @ApiProperty({
    type: Boolean,
    description: 'Indicates if the user likes the profile',
    example: true,
  })
  @IsBoolean({ message: 'isLike must be a boolean' })
  isLike: boolean;
}
