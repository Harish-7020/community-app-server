import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
  } from 'typeorm';
  import { User } from './user.entity';
import { CommunityMember } from './community-member.entity';
  
  @Entity({ name: 'community' })
  export class Community {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'varchar', length: 100 })
    name: string;
  
    @Column({ type: 'text', nullable: true })
    description?: string;

    @OneToMany(() => CommunityMember, (membership) => membership.community)
    members: CommunityMember[];
    
    @ManyToOne(() => User, (user) => user.communities, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'createdBy' })
    createdBy: User;
  
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @Column({ type: 'timestamptz', nullable: true })
    deletedAt: Date;

    @ManyToOne(() => User, (user) => user.userID, { nullable: true })
    @JoinColumn({ name: 'deletedBy' })
    deletedBy: User;
  }
  