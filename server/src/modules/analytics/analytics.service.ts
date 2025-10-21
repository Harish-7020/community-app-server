// analytics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/shared/entities/user.entity';
import { Community } from 'src/shared/entities/community.entity';
import { CommunityPost } from 'src/shared/entities/community-post.entity';
import { PostLike } from 'src/shared/entities/post-like.entity';
import { PostComment } from 'src/shared/entities/post-comment.entity';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Community)
    private readonly communityRepo: Repository<Community>,
    @InjectRepository(CommunityPost)
    private readonly postRepo: Repository<CommunityPost>,
    @InjectRepository(PostLike)
    private readonly likeRepo: Repository<PostLike>,
    @InjectRepository(PostComment)
    private readonly commentRepo: Repository<PostComment>,
  ) {}

  // --- Overview (combined metrics) ---
  async getOverview(dto: AnalyticsQueryDto) {
    const [userMetrics, communityMetrics, postMetrics, engagementMetrics] = await Promise.all([
      this.getUserMetrics(dto),
      this.getCommunityMetrics(dto),
      this.getPostMetrics(dto),
      this.getEngagementMetrics(dto),
    ]);

    return {
      totalUsers: userMetrics.totalUsers,
      newUsers: userMetrics.newUsers,
      totalCommunities: communityMetrics.totalCommunities,
      activeCommunities: communityMetrics.newCommunities,
      totalPosts: postMetrics.totalPosts,
      popularPosts: postMetrics.likesPerPost.slice(0, 5),
      topEngagedUsers: engagementMetrics.topUsers,
      trends: await this.getTrendsMetrics(dto),
    };
  }

  // --- Users Metrics ---
  async getUserMetrics(dto: AnalyticsQueryDto) {
    const { startDate, endDate } = dto;
    const qb = this.userRepo.createQueryBuilder('u');

    if (startDate) qb.andWhere('u.createdAt >= :startDate', { startDate });
    if (endDate) qb.andWhere('u.createdAt <= :endDate', { endDate });

    const totalUsers = await qb.getCount();

    const newUsers = await qb
      .select('COUNT(u.userID)', 'count')
      .getRawOne();

    return { totalUsers, newUsers: Number(newUsers.count) };
  }

  // --- Communities Metrics ---
  async getCommunityMetrics(dto: AnalyticsQueryDto) {
    const { startDate, endDate } = dto;
    const qb = this.communityRepo.createQueryBuilder('c');

    if (startDate) qb.andWhere('c.createdAt >= :startDate', { startDate });
    if (endDate) qb.andWhere('c.createdAt <= :endDate', { endDate });

    const totalCommunities = await qb.getCount();

    const newCommunities = await qb
      .select('COUNT(c.id)', 'count')
      .getRawOne();

    // Members per community
    const membersPerCommunity = await this.communityRepo.query(`
      SELECT c.id as "communityId", c.name, COUNT(cm."userId") as "membersCount"
      FROM community c
      LEFT JOIN community_members cm ON cm."communityId" = c.id
      GROUP BY c.id
      ORDER BY "membersCount" DESC
    `);

    return { totalCommunities, newCommunities: Number(newCommunities.count), membersPerCommunity };
  }

  // --- Posts Metrics ---
  async getPostMetrics(dto: AnalyticsQueryDto) {
    const { startDate, endDate } = dto;
    const qb = this.postRepo.createQueryBuilder('p');

    if (startDate) qb.andWhere('p.createdAt >= :startDate', { startDate });
    if (endDate) qb.andWhere('p.createdAt <= :endDate', { endDate });

    const totalPosts = await qb.getCount();

    const postsPerCommunity = await this.postRepo.query(`
      SELECT c.id as "communityId", c.name, COUNT(p.id) as "postsCount"
      FROM community_post p
      LEFT JOIN community c ON c.id = p."communityId"
      GROUP BY c.id
      ORDER BY "postsCount" DESC
    `);

    const likesPerPost = await this.likeRepo.query(`
      SELECT p.id as "postId", COUNT(l.id) as "likesCount"
      FROM community_post p
      LEFT JOIN post_like l ON l."postId" = p.id
      GROUP BY p.id
      ORDER BY "likesCount" DESC
      LIMIT 10
    `);

    const commentsPerPost = await this.commentRepo.query(`
      SELECT p.id as "postId", COUNT(c.id) as "commentsCount"
      FROM community_post p
      LEFT JOIN post_comment c ON c."postId" = p.id
      GROUP BY p.id
      ORDER BY "commentsCount" DESC
      LIMIT 10
    `);

    return { totalPosts, postsPerCommunity, likesPerPost, commentsPerPost };
  }

  // --- Engagement Metrics ---
  async getEngagementMetrics(dto: AnalyticsQueryDto) {
    const { limit = 5 } = dto;

    // Top active users (by posts + comments)
    const topUsers = await this.userRepo.query(`
        SELECT u."userID", u."firstName", u."lastName", 
          COUNT(DISTINCT p.id) AS "postsCount",
          COUNT(DISTINCT c.id) AS "commentsCount"
        FROM "user" u
        LEFT JOIN community_post p ON p."userId" = u."userID"
        LEFT JOIN post_comment c ON c."userId" = u."userID"
        GROUP BY u."userID"
        ORDER BY (COUNT(DISTINCT p.id) + COUNT(DISTINCT c.id)) DESC
        LIMIT ${limit}
      `);

    // Top engaged communities (by posts + comments)
    const topCommunities = await this.communityRepo.query(`
        SELECT c.id, c.name, 
          COUNT(DISTINCT p.id) AS "postsCount",
          COUNT(DISTINCT cm.id) AS "membersCount"
        FROM community c
        LEFT JOIN community_post p ON p."communityId" = c.id
        LEFT JOIN community_members cm ON cm."communityId" = c.id
        GROUP BY c.id
        ORDER BY COUNT(DISTINCT p.id) DESC
        LIMIT ${limit}
      `);

    return { topUsers, topCommunities };
  }

  // --- Trends Metrics (daily / weekly / monthly) ---
  async getTrendsMetrics(dto: AnalyticsQueryDto) {
    const { startDate, endDate } = dto;
    
    // Default to last 30 days if no dates provided
    const defaultStartDate = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const defaultEndDate = endDate || new Date().toISOString().split('T')[0];

    const dailyPosts = await this.postRepo.query(`
      SELECT DATE("createdAt") as date, COUNT(id) as "postsCount"
      FROM community_post
      WHERE "createdAt" BETWEEN '${defaultStartDate}' AND '${defaultEndDate}'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `);

    const dailyUsers = await this.userRepo.query(`
      SELECT DATE("createdAt") as date, COUNT("userID") as "usersCount"
      FROM "user"
      WHERE "createdAt" BETWEEN '${defaultStartDate}' AND '${defaultEndDate}'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `);

    return { dailyPosts, dailyUsers };
  }
}
