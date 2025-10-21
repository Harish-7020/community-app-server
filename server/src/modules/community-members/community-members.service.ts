import {
    Injectable,
    ConflictException,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { CommunityMember } from 'src/shared/entities/community-member.entity';
  import { Community } from 'src/shared/entities/community.entity';
  import { User } from 'src/shared/entities/user.entity';
  
  @Injectable()
  export class CommunityMembersService {
    constructor(
      @InjectRepository(CommunityMember)
      private readonly memberRepo: Repository<CommunityMember>,
      @InjectRepository(Community)
      private readonly communityRepo: Repository<Community>,
      @InjectRepository(User)
      private readonly userRepo: Repository<User>,
    ) {}
  
    async joinCommunity(communityId: number, userId: number): Promise<CommunityMember> {
      const user = await this.userRepo.findOne({ where: { userID: userId } });
      if (!user) throw new NotFoundException('User not found');
  
      const community = await this.communityRepo.findOne({ where: { id: communityId } });
      if (!community) throw new NotFoundException('Community not found');
  
      const existing = await this.memberRepo.findOne({
        where: { user: { userID: userId }, community: { id: communityId } },
      });
      if (existing) throw new ConflictException('Already a member of this community');
  
      const membership = this.memberRepo.create({ user, community });
      return await this.memberRepo.save(membership);
    }
  
    async leaveCommunity(communityId: number, userId: number): Promise<{ message: string }> {
      const membership = await this.memberRepo.findOne({
        where: { user: { userID: userId }, community: { id: communityId } },
        relations: ['community', 'user'],
      });
      if (!membership) throw new NotFoundException('You are not a member of this community');
  
      await this.memberRepo.remove(membership);
      return { message: 'Left community successfully' };
    }
  
    async getCommunityMembers(communityId: number): Promise<CommunityMember[]> {
      const members = await this.memberRepo.find({
        where: { community: { id: communityId } },
        relations: ['user'],
      });
      return members;
    }
  
    async getUserCommunities(userId: number): Promise<CommunityMember[]> {
      return this.memberRepo.find({
        where: { user: { userID: userId } },
        relations: ['community'],
      });
    }
  }
  