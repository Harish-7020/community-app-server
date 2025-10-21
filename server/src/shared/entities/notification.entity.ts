import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    JoinColumn,
  } from 'typeorm';
  import { User } from 'src/shared/entities/user.entity';
  import { NotificationType } from '../enum/notification.type';
  
  @Entity({ name: 'notification' })
  export class Notification {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'enum', enum: NotificationType })
    type: NotificationType;
  
    @Column({ type: 'text', nullable: true })
    content?: string;
  
    // optional reference id (post/comment/community/user id etc)
    @Column({ type: 'int', nullable: true })
    referenceId?: number;
  
    // optional string to indicate what referenceId is: 'post'|'comment'|'community'|'user'
    @Column({ type: 'varchar', length: 50, nullable: true })
    referenceType?: string;
  
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;
  
    @Column({ type: 'boolean', default: false })
    isRead: boolean;
  
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
  
    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deletedAt?: Date;
  }
  