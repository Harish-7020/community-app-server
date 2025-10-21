import { Exclude } from 'class-transformer';
import {
  BaseEntity as TypeOrmBaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Community } from './community.entity';
import { CommunityMember } from './community-member.entity';


@Entity({ name: 'user' })
export class User extends TypeOrmBaseEntity {
  @PrimaryGeneratedColumn()
  userID: number;

  @Column({ length: 25 })
  firstName?: string;

  @Column({ length: 25 })
  lastName?: string;

  @Column({ length: 50, nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  aboutMe?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profilePicture?: string;

  @Exclude({ toPlainOnly: true })
  @Column({ length: 255, select: false })
  password?: string;

  @OneToMany(() => CommunityMember, (membership) => membership.user)
  memberships: CommunityMember[];
  
  @ManyToOne(() => User, (user: User) => user.userID, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @CreateDateColumn({ type: 'timestamptz', select: false })
  createdAt: Date;

  @ManyToOne(() => User, (user: User) => user.userID, { nullable: true })
  @JoinColumn({ name: 'modifiedBy' })
  modifiedBy: User;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true, select: false })
  modifiedAt: Date;

  @Column({ type: 'timestamptz', nullable: true, select: false })
  deletedAt: Date;
  
  @ManyToOne(() => User, (user: User) => user.userID, { nullable: true })
  @JoinColumn({ name: 'deletedBy' })
  deletedBy: User;

  @OneToMany(() => Community, (community: Community) => community.createdBy)
  communities: Community[];

}
