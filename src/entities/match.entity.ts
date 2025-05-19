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
  userEnterprise: Enterprise;

  @Column({ default: false })
  enterpriseLike: boolean;

  @ManyToOne(() => Student, (student) => student.matches, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  userStudent: Student;

  @Column({ default: false })
  studentLike: boolean;
}
