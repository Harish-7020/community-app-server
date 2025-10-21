import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { User } from 'src/shared/entities/user.entity';
import { Community } from 'src/shared/entities/community.entity';
import { PostLike } from './post-like.entity';
import { PostComment } from './post-comment.entity';

@Entity({ name: 'community_post' })
export class CommunityPost {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Community, (community) => community.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'communityId' })
  community: Community;

  @ManyToOne(() => User, (user) => user.userID, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  mediaUrl?: string;

  @OneToMany(() => PostLike, (like) => like.post)
  likes: PostLike[];

  @OneToMany(() => PostComment, (comment) => comment.post)
  comments: PostComment[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
