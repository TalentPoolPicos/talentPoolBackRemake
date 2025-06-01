import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { UserDto } from 'src/dtos/user.dto';

export class LikeDto {
  @ApiProperty({
    type: String,
    description: 'The uuid of the user',
  })
  @IsString({ message: 'UUID must be a string' })
  uuid: string;

  @ApiProperty({
    type: Date,
    description: 'The date the user was created',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'The date the user was last updated',
  })
  updatedAt: Date;

  @ApiProperty({
    type: UserDto,
    description: 'The initiator',
  })
  initiator: UserDto;

  @ApiProperty({
    type: UserDto,
    description: 'The receiver',
  })
  receiver: UserDto;
}
