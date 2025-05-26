import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('addresses')
export class Address extends BaseEntity {
  /**
   * @description CEP
   */
  @Column({ length: 10 })
  zipCode: string;

  /**
   * @description Rua
   */
  @Column({ length: 100, nullable: true })
  street: string;

  /**
   * @description Bairro
   */
  @Column({ length: 100, nullable: true })
  neighborhood: string;

  /**
   * @description Cidade
   */
  @Column({ length: 100, nullable: true })
  city: string;

  /**
   * @description Estado
   */
  @Column({ length: 100, nullable: true })
  state: string;

  @OneToOne(() => User, (user) => user.address, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
