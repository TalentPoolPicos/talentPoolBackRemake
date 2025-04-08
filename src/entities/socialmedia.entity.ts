import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { SocialMediaType } from 'src/common/enums/social.enum';
import { User } from './user.entity';

@Entity('social_media')
export class SocialMedia extends BaseEntity {
  @Column({
    type: 'enum',
    enum: SocialMediaType,
  })
  type: string;

  @Column({ length: 255 })
  url: string;

  @ManyToOne(() => User, (user) => user.socialMedia)
  @JoinColumn()
  user: User;
}
