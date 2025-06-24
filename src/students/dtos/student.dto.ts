import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEmail, IsString } from 'class-validator';

export class StudentDto {
  @ApiProperty({
    type: String,
    description: 'The uuid of the student',
  })
  @IsString({ message: 'UUID must be a string' })
  uuid: string;

  @ApiProperty({
    type: Boolean,
    description: 'The status of the student',
    required: true,
  })
  isCompleted: boolean;

  @ApiProperty({
    type: String,
    description: 'The name of the student',
    required: false,
  })
  @IsString({ message: 'Name must be a string' })
  name: string | null;

  @ApiProperty({
    type: String,
    description: 'The email of the student',
    required: false,
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string | null;

  @ApiProperty({
    type: String,
    description: 'The registration number of the student',
    required: false,
  })
  @IsString({ message: 'Registration number must be a string' })
  registrationNumber: string | null;

  @ApiProperty({
    type: String,
    description: 'The course of the student',
    required: false,
  })
  @IsString({ message: 'Course must be a string' })
  course: string | null;

  @ApiProperty({
    type: String,
    description: 'The description of the student',
    required: false,
  })
  @IsString({ message: 'Description must be a string' })
  description: string | null;

  @ApiProperty({
    type: Date,
    description: 'The date the student was created',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'The date the student was last updated',
  })
  updatedAt: Date;

  @ApiProperty({
    type: Date,
    description: 'The date of birth of the student',
    required: false,
  })
  @IsDate({ message: 'Birthdate must be a date' })
  birthdate: Date | null;

  @ApiProperty({
    type: String,
    description: 'The url of the curriculum',
    required: false,
  })
  @IsString({ message: 'Curriculum must be a string' })
  curriculum: string | null;

  @ApiProperty({
    type: String,
    description: 'The url of the history',
    required: false,
  })
  @IsString({ message: 'History must be a string' })
  history: string | null;

  @ApiProperty({
    type: String,
    description: 'The url of the lattes',
    required: false,
  })
  @IsString({ message: 'Lattes must be a string' })
  lattes: string | null;
}
