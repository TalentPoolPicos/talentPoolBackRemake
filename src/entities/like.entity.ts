import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('likes')
export class Like extends BaseEntity {
  @ManyToOne(() => User, (user) => user.initiators, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  initiator: User;

  @ManyToOne(() => User, (user) => user.receivers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  receiver: User;
}
