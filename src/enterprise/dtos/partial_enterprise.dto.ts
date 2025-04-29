import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class PartialEnterpriseDto {
  @ApiProperty({
    type: String,
    description: 'The name of the enterprise',
    required: false,
  })
  @IsString({ message: 'Name must be a string' })
  name?: string;

  @ApiProperty({
    type: String,
    description: 'The email of the enterprise',
    required: false,
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @ApiProperty({
    type: String,
    description: 'The description of the enterprise',
    required: false,
  })
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({
    type: String,
    description: 'The CNPJ of the enterprise',
    required: false,
  })
  cnpj?: string;

  @ApiProperty({
    type: String,
    description: 'The social reason of the enterprise',
    required: false,
  })
  @IsString({ message: 'Social reason must be a string' })
  socialReason?: string;

  @ApiProperty({
    type: String,
    description: 'The fantasy name of the enterprise',
    required: false,
  })
  @IsString({ message: 'Fantasy name must be a string' })
  fantasyName?: string;
}
