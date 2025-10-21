import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/shared/entities/user.entity';
import { Community } from 'src/shared/entities/community.entity';

@Entity('community_members')
@Unique(['user', 'community'])
export class CommunityMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Community, (community) => community.members, {
    onDelete: 'CASCADE',
  })
  community: Community;

  @CreateDateColumn()
  joinedAt: Date;
}
