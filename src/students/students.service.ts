import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from 'src/entities/student.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
  ) {}

  async findById(id: number): Promise<Student | null> {
    return this.studentsRepository.findOne({
      where: { id },
      cache: true,
    });
  }

  async findByUuid(uuid: string): Promise<Student | null> {
    return this.studentsRepository.findOne({
      where: { uuid },
      cache: true,
    });
  }

  async findAll(): Promise<Student[]> {
    return this.studentsRepository.find();
  }

  async findAndCountAll(
    page: number,
    limit: number,
  ): Promise<{ students: Student[]; total: number }> {
    if (limit < 1) limit = 1;
    if (limit > 20) limit = 20;

    const [students, total] = await this.studentsRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
      cache: true,
    });
    return { students, total };
  }

  async checkIfStudentExistsByUuid(uuid: string): Promise<boolean> {
    const student = await this.studentsRepository.findOne({ where: { uuid } });
    return !!student;
  }

  async checkIfStudentExistsById(id: number): Promise<boolean> {
    const student = await this.studentsRepository.findOne({ where: { id } });
    return !!student;
  }

  async deleteByUuid(uuid: string): Promise<void> {
    const result = await this.checkIfStudentExistsByUuid(uuid);
    if (!result) throw new NotFoundException('Student not found');
    await this.studentsRepository.delete({ uuid });
  }

  async create(student: {
    firstName: string;
    lastName: string;
    email: string;
    birthDate: Date;
    curriculum: string;
    history: string;
    lattes: string;
    registrationNumber: string;
    description: string;
  }): Promise<Student> {
    const newStudent = this.studentsRepository.create(student);
    return this.studentsRepository.save(newStudent);
  }

  async update(
    id: number,
    student: {
      firstName?: string;
      lastName?: string;
      email?: string;
      birthDate?: Date;
      curriculum?: string;
      history?: string;
      lattes?: string;
      registrationNumber?: string;
      description?: string;
    },
  ): Promise<Student> {
    const existingStudent = await this.findById(id);
    if (!existingStudent) throw new NotFoundException('Student not found');
    Object.assign(existingStudent, student);
    existingStudent.updatedAt = new Date();
    return this.studentsRepository.save(existingStudent);
  }
}
