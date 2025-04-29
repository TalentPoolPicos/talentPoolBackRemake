import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('enterprises')
export class Enterprise extends BaseEntity {
  /**
   * @description Indica se o usuário tem as informações mínimas para ser considerado completo
   */
  @Column({ default: false })
  isComplete: boolean;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  fantasyName: string;

  @Column({ length: 14 })
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
}
