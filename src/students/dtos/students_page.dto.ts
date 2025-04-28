import { ApiProperty } from '@nestjs/swagger';
import { StudentDto } from './student.dto';

export class StudentsPageDto {
  @ApiProperty({
    type: StudentDto,
    description: 'The list of students',
  })
  students: StudentDto[];

  @ApiProperty({
    type: Number,
    description: 'The total number of students',
  })
  total: number;
}
