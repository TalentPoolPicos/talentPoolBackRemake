import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Student } from './student.entity';
import { Enterprise } from './enterprise.entity';

@Entity('match')
export class Match extends BaseEntity {
  @ManyToOne(() => Enterprise, (enterprise) => enterprise.matches, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  enterprise: Enterprise;

  @Column({ default: false })
  enterpriseLike: boolean;

  @ManyToOne(() => Student, (student) => student.matches, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  student: Student;

  @Column({ default: false })
  studentLike: boolean;
}
