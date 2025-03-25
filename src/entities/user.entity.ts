import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Student } from './student.entity';
import { Enterprise } from './enterprise.entity';
import { Role } from 'src/common/enums/roles.enum';

@Entity('users')
export class User extends BaseEntity {
  @Column({ length: 100, unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.STUDENT,
  })
  role: string;

  @Column({ nullable: true })
  profilePicture?: string;

  @OneToOne(() => Student, { nullable: true })
  @JoinColumn()
  student?: Student;

  @OneToOne(() => Enterprise, { nullable: true })
  @JoinColumn()
  enterprise?: Enterprise;
}
