import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class AddressDto {
  @ApiProperty({
    type: String,
    description: 'The uuid of the address',
  })
  @IsUUID()
  uuid: string;

  @ApiProperty({
    type: Date,
    description: 'The date the address was created',
  })
  @IsDate({ message: 'Created at must be a date' })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'The date the address was last updated',
  })
  @IsDate({ message: 'Updated at must be a date' })
  updatedAt: Date;

  @ApiProperty({
    type: String,
    example: '12345-678',
    description: 'The zip code of the address',
    maxLength: 10,
    minLength: 8,
  })
  @IsString({ message: 'Zip code must be a string' })
  zipCode: string;

  @ApiProperty({
    type: String,
    example: 'Street Exemplo',
    description: 'The street of the address',
    maxLength: 100,
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Street must be a string' })
  street: string;

  @ApiProperty({
    type: String,
    example: 'Neighborhood Exemplo',
    description: 'The neighborhood of the address',
    maxLength: 100,
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Neighborhood must be a string' })
  neighborhood: string;

  @ApiProperty({
    type: String,
    example: 'City Exemplo',
    description: 'The city of the address',
    maxLength: 100,
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'City must be a string' })
  city: string;

  @ApiProperty({
    type: String,
    example: 'State Exemplo',
    description: 'The state of the address',
    maxLength: 100,
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'State must be a string' })
  state: string;
}
