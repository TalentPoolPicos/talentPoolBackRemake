import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Student } from './student.entity';
import { Enterprise } from './enterprise.entity';
import { Role } from 'src/common/enums/roles.enum';
import { SocialMedia } from './socialmedia.entity';
import { Tag } from './tag.entity';

@Entity('users')
export class User extends BaseEntity {
  /**
   * @description Indica se o usuário tem as informações mínimas para ser considerado completo
   */
  @Column({ default: false })
  isComplete: boolean;

  /**
   * @description Indica se o usuário já verificou o e-mail
   */
  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isDeleted: boolean;

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
  profilePictureUuid?: string;

  @Column({ nullable: true })
  profilePicture?: string;

  @Column({ nullable: true })
  bannerPictureUuid?: string;

  @Column({ nullable: true })
  bannerPicture?: string;

  @OneToOne(() => Student, { nullable: true })
  @JoinColumn()
  student?: Student;

  @OneToOne(() => Enterprise, { nullable: true })
  @JoinColumn()
  enterprise?: Enterprise;

  @OneToMany(() => SocialMedia, (socialMedia) => socialMedia.user)
  socialMedia: SocialMedia[];

  @OneToMany(() => Tag, (tag) => tag.user)
  tags: Tag[];
}
