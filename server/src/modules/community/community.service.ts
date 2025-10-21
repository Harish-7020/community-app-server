import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Community } from 'src/shared/entities/community.entity';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { User } from 'src/shared/entities/user.entity';
import { CommunityMember } from 'src/shared/entities/community-member.entity';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(Community)
    private readonly communityRepo: Repository<Community>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(CommunityMember)
    private readonly memberRepo: Repository<CommunityMember>,
  ) {}

  async createCommunity(dto: CreateCommunityDto, userId: number): Promise<Community> {
    const user = await this.userRepo.findOne({ where: { userID: userId } });
    if (!user) throw new NotFoundException('User not found');

    const community = this.communityRepo.create({
      name: dto.name,
      description: dto.description,
      createdBy: user,
    });

    const saved = await this.communityRepo.save(community);

    // Ensure the creator is automatically joined as a member
    const existingMembership = await this.memberRepo.findOne({
      where: { user: { userID: user.userID }, community: { id: saved.id } },
    });
    if (!existingMembership) {
      const membership = this.memberRepo.create({ user, community: saved });
      await this.memberRepo.save(membership);
    }

    return saved;
  }

  async getAllCommunities(currentUserId?: number): Promise<any[]> {
    const communities = await this.communityRepo.find({ relations: ['createdBy'] });
    if (!currentUserId) return communities;

    // Enrich with memberCount and isJoined
    const result = await Promise.all(
      communities.map(async (c) => {
        const memberCount = await this.memberRepo.count({ where: { community: { id: c.id } } });
        const isJoined = !!(await this.memberRepo.findOne({
          where: { community: { id: c.id }, user: { userID: currentUserId } },
        }));
        return { ...c, memberCount, isJoined };
      }),
    );
    return result;
  }

  async getCommunityById(id: number, currentUserId?: number): Promise<any> {
    const community = await this.communityRepo.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    if (!community) throw new NotFoundException('Community not found');

    if (!currentUserId) return community;

    const memberCount = await this.memberRepo.count({ where: { community: { id } } });
    const isJoined = !!(await this.memberRepo.findOne({
      where: { community: { id }, user: { userID: currentUserId } },
    }));
    return { ...community, memberCount, isJoined };
  }

  async updateCommunity(
    id: number,
    dto: UpdateCommunityDto,
    userId: number,
  ): Promise<Community> {
    const community = await this.getCommunityById(id);
    if (community.createdBy.userID !== userId)
      throw new ForbiddenException('You are not allowed to update this community');

    Object.assign(community, dto);
    return await this.communityRepo.save(community);
  }

  async deleteCommunity(id: number, userId: number): Promise<{ message: string }> {
    const community = await this.getCommunityById(id);
    if (community.createdBy.userID !== userId)
      throw new ForbiddenException('You are not allowed to delete this community');

    // Soft delete: set deletedAt and deletedBy
    community.deletedAt = new Date();
    const user = await this.userRepo.findOne({ where: { userID: userId } });
    community.deletedBy = user as User;
    await this.communityRepo.save(community);

    return { message: 'Community deleted successfully' };
  }
}
