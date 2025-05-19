import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('tag')
export class Tag extends BaseEntity {
  @Column({ length: 40 })
  label: string;

  @ManyToOne(() => User, (user) => user.tag, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
