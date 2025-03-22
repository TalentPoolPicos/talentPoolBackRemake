import { BaseEntity, Column, Entity } from 'typeorm';

export enum Role {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  STUDENT = 'student',
  ENTERPRISE = 'enterprise',
  TEACHER = 'teacher',
}

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
}
