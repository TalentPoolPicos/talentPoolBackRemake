import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({
    type: String,
    example: 'nodejs',
    description: 'The label of the tag',
    maxLength: 40,
    minLength: 3,
  })
  @IsString({ message: 'Label must be a string' })
  @IsNotEmpty({ message: 'Label is required' })
  label: string;
}
