import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Unique,
    CreateDateColumn,
    JoinColumn,
    DeleteDateColumn,
  } from 'typeorm';
  import { User } from 'src/shared/entities/user.entity';
  import { CommunityPost } from './community-post.entity';
  
  @Entity({ name: 'post_like' })
  @Unique(['user', 'post'])
  export class PostLike {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => User, (user) => user.userID, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;
  
    @ManyToOne(() => CommunityPost, (post) => post.likes, {
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'postId' })
    post: CommunityPost;
  
    @CreateDateColumn({ type: 'timestamptz' })
    likedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date;
  }
  