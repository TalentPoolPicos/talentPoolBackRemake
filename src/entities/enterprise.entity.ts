import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('enterprises')
export class Enterprise extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  fantasyName: string;

  @Column({ length: 14 })
  cnpj: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  email: string;

  @Column({ length: 100, nullable: true })
  socialReason: string;

  @Column({ length: 255, nullable: true })
  description: string;
}
