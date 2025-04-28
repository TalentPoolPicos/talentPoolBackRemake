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
      name: student.name,
      email: student.email,
      registrationNumber: student.registrationNumber,
      description: student.description,
      created_at: student.createdAt,
      updated_at: student.updatedAt,
      birthdate: student.birthDate,
      curriculum: student.curriculum,
      history: student.history,
      lattes: student.lattes,
    };
  }
}
