import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    JoinColumn,
    OneToMany,
    DeleteDateColumn,
  } from 'typeorm';
  import { User } from 'src/shared/entities/user.entity';
  import { CommunityPost } from './community-post.entity';
  
  @Entity({ name: 'post_comment' })
  export class PostComment {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => CommunityPost, (post) => post.comments, {
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'postId' })
    post: CommunityPost;
  
    @ManyToOne(() => User, (user) => user.userID, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;
  
    @Column({ type: 'text' })
    content: string;
  
    @ManyToOne(() => PostComment, (comment) => comment.replies, {
      nullable: true,
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'parentId' })
    parent?: PostComment;
  
    @OneToMany(() => PostComment, (comment) => comment.parent)
    replies: PostComment[];
  
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date;
  }
  