import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('students')
export class Student extends BaseEntity {
  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ type: 'timestamp', nullable: true })
  birthDate: Date;

  // Url do pdf do currículo
  @Column({ nullable: true })
  curriculum: string;

  // lattes url
  @Column({ nullable: true })
  lattes: string;

  @Column({ nullable: true })
  email: string;

  // Número de matrícula
  @Column({
    length: 11,
    nullable: true,
  })
  registrationNumber: string;

  @Column({
    length: 255,
    nullable: true,
  })
  description: string;
}
