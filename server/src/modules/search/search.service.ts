import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/shared/entities/user.entity';
import { Community } from 'src/shared/entities/community.entity';
import { CommunityPost } from 'src/shared/entities/community-post.entity';
import { SearchQueryDto, SearchType } from './dto/search-query.dto';
import { SearchResult } from 'src/shared/interfaces/search/search-result.interface';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Community)
    private readonly communityRepo: Repository<Community>,
    @InjectRepository(CommunityPost)
    private readonly postRepo: Repository<CommunityPost>,
  ) {}

  async search(dto: SearchQueryDto) {
    const { query, type, page = 1, limit = 10 } = dto;
    const skip = (page - 1) * limit;
    const results: SearchResult[] = [];
    let totalCount = 0;

    const searchTerm = `%${query.toLowerCase()}%`;
    
    if (type === SearchType.USER || type === SearchType.ALL) {
      const [users, count] = await this.userRepo
        .createQueryBuilder('user')
        .where('LOWER(user.firstName) LIKE LOWER(:q)', { q: `%${query}%` })
        .orWhere('LOWER(user.lastName) LIKE LOWER(:q)', { q: `%${query}%` })
        .orWhere('LOWER(user.email) LIKE LOWER(:q)', { q: `%${query}%` })
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      results.push(
        ...users.map((u) => ({
          type: 'user' as const,
          id: u.userID,
          name: `${u.firstName} ${u.lastName}`,
          avatar: u.profilePicture,
          createdAt: u.createdAt,
        })),
      );

      totalCount += count;
    }

    if (type === SearchType.COMMUNITY || type === SearchType.ALL) {
      const [communities, count] = await this.communityRepo
        .createQueryBuilder('community')
        .where('LOWER(community.name) LIKE LOWER(:q)', { q: `%${query}%` })
        .orWhere('LOWER(community.description) LIKE LOWER(:q)', { q: `%${query}%` })
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      results.push(
        ...communities.map((c) => ({
          type: 'community' as const,
          id: c.id,
          name: c.name,
          //avatar: c.imageUrl,
          createdAt: c.createdAt,
        })),
      );

      totalCount += count;
    }

    if (type === SearchType.POST || type === SearchType.ALL) {
      const [posts, count] = await this.postRepo
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .leftJoinAndSelect('post.community', 'community')
        .where('LOWER(post.content) LIKE LOWER(:q)', { q: `%${query}%` })
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      results.push(
        ...posts.map((p) => ({
          type: 'post' as const,
          id: p.id,
          title: p.community?.name,
          content: p.content,
          createdAt: p.createdAt,
        })),
      );

      totalCount += count;
    }

    results.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return {
      data: results,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }
}
