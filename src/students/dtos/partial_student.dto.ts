import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class PartialStudentDto {
  @ApiProperty({
    type: String,
    required: false,
    example: 'john',
    description: 'The student name',
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string;

  @ApiProperty({
    type: Date,
    required: false,
    description: 'The student birth date',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birthDate?: Date;

  @ApiProperty({
    type: String,
    required: false,
    description: 'The student lattes',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Lattes must be a valid URL' })
  lattes?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'The student email',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  registrationNumber?: string;

  // curso
  @ApiProperty({
    type: String,
    required: false,
    description: 'The student course',
  })
  @IsOptional()
  @IsString({ message: 'Course must be a string' })
  course?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'The student description',
  })
  description?: string;
}
