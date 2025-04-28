import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('students')
export class Student extends BaseEntity {
  /**
   * @description Indica se o usuário tem as informações mínimas para ser considerado completo
   */
  @Column({ default: false })
  isComplete: boolean;

  @Column({ length: 100, nullable: true })
  name: string;

  @Column({ type: 'timestamp', nullable: true })
  birthDate: Date;

  // Url do pdf do currículo
  @Column({ nullable: true })
  curriculum: string;
  @Column({ nullable: true })
  curriculumUuid: string;

  // Url do pdf do histórico
  @Column({ nullable: true })
  history: string;
  @Column({ nullable: true })
  historyUuid: string;

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

  @OneToOne(() => User, (user) => user.student, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
