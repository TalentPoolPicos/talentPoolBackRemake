import { Student } from 'src/entities/student.entity';
import { StudentDto } from './dtos/student.dto';

// Criar adapter
export class StudentAdapter {
  /**
   * Converts a Student entity to a StudentDto.
   * @param student - The Student entity to convert.
   * @returns The converted StudentDto.
   */
  static entityToDto(student: Student): StudentDto {
    return {
      uuid: student.uuid,
      isCompleted: student.isComplete,
      name: student.name ? student.name : null,
      email: student.email ? student.email : null,
      registrationNumber: student.registrationNumber
        ? student.registrationNumber
        : null,
      course: student.course ? student.course : null,
      description: student.description ? student.description : null,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      birthdate: student.birthDate ? student.birthDate : null,
      curriculum: student.curriculum,
      history: student.history ? student.history : null,
      lattes: student.lattes ? student.lattes : null,
    };
  }
}
