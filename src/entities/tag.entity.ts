import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('tag')
export class Tag extends BaseEntity {
  @Column({ length: 20 })
  label: string;

  @ManyToOne(() => User, (user) => user.tags)
  @JoinColumn()
  user: User;
}
