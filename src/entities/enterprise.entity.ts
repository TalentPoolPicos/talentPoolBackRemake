import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Match } from './match.entity';

@Entity('enterprises')
export class Enterprise extends BaseEntity {
  /**
   * @description Indica se o usuário tem as informações mínimas para ser considerado completo
   */
  @Column({ default: false })
  isComplete: boolean;

  @Column({ length: 100, nullable: true })
  name: string;

  @Column({ length: 100, nullable: true })
  fantasyName: string;

  @Column({ length: 18, nullable: true })
  cnpj: string;

  @Column({ nullable: true })
  email: string;

  @Column({ length: 100, nullable: true })
  socialReason: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @OneToOne(() => User, (user) => user.enterprise, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @OneToMany(() => Match, (match) => match.userEnterprise)
  matches: Match[];
}
