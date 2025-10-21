import { BadRequestException, Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CommunityPost } from 'src/shared/entities/community-post.entity';
import { CreateCommunityPostDto } from './dto/create-community-post.dto';
import { Community } from 'src/shared/entities/community.entity';
import { User } from 'src/shared/entities/user.entity';
import { PostLike } from 'src/shared/entities/post-like.entity';
import { PostComment } from 'src/shared/entities/post-comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommunityPostDto } from './dto/update-community-post.dto';
import { NotificationService } from '../notification/notification.service';
import { CreateNotificationDto } from '../notification/dto/create-notification.dto';
import { NotificationType } from 'src/shared/enum/notification.type';
import { FeedGateway } from './feed.gateway';

@Injectable()
export class CommunityPostService {
  constructor(
    @InjectRepository(CommunityPost)
    private readonly postRepo: Repository<CommunityPost>,
    @InjectRepository(Community)
    private readonly communityRepo: Repository<Community>,
    @InjectRepository(PostLike)
    private readonly likeRepo: Repository<PostLike>,
    @InjectRepository(PostComment)
    private readonly commentRepo: Repository<PostComment>,
    private readonly notificationService: NotificationService,
    @Inject(forwardRef(() => FeedGateway))
    private readonly feedGateway: FeedGateway,
  ) {}

  async createPost(dto: CreateCommunityPostDto, user: User, mediaUrl?: string) {
    const community = await this.communityRepo.findOneBy({ id: Number(dto.communityId) });
    if (!community) throw new NotFoundException('Community not found');

    const post = this.postRepo.create({
      content: dto.content,
      mediaUrl,
      community,
      user,
    });
    const savedPost = await this.postRepo.save(post);

    // Fetch the post with all relations for real-time emission
    const fullPost = await this.postRepo.findOne({
      where: { id: savedPost.id },
      relations: ['user', 'community'],
    });

    // Get like count
    const likeCount = await this.likeRepo.count({
      where: { post: { id: savedPost.id }, deletedAt: IsNull() },
    });

    // Get comment count
    const commentCount = await this.commentRepo.count({
      where: { post: { id: savedPost.id }, deletedAt: IsNull() },
    });

    // Emit real-time feed update to all community members
    try {
      this.feedGateway.emitNewPostToCommunity(community.id, {
        ...fullPost,
        likeCount,
        commentCount,
        isLiked: false,
      });
    } catch (err) {
      console.error('Failed to emit feed update:', err?.message);
    }

    const members = await this.communityRepo.query(
      `SELECT "userId" FROM community_members WHERE "communityId" = $1 AND "userId" != $2`,
      [dto.communityId, user.userID],
    );

    for (const member of members) {
      const notificationDto: CreateNotificationDto = {
        type: NotificationType.POST_CREATED,
        content: `${user.firstName} posted in ${community.name}`,
        referenceId: savedPost.id,
        referenceType: 'CommunityPost',
        userId: member.userId,
      };
      await this.notificationService.createNotification(notificationDto);
    }
    return savedPost;
  }

  async updatePost(
    postId: number,
    user: User,
    dto: UpdateCommunityPostDto,
    mediaUrl?: string,
  ) {
    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['user'],
    });
    if (!post) throw new NotFoundException('Post not found');
  
    if (post.user.userID !== user.userID)
      throw new BadRequestException('You can only update your own post');
  
    if (dto.content) post.content = dto.content;
    if (mediaUrl) post.mediaUrl = mediaUrl;
    return this.postRepo.save(post);
  }

  async getPostsByCommunity(
    communityId: number,
    userId: number,
    page: number = 1,
    limit: number = 10,
    sort: string = 'createdAt',
    order: 'ASC' | 'DESC' = 'DESC',
    filter: string = '',
  ) {
    const offset = (page - 1) * limit;
  
    // Allowed columns for sorting
    const allowedSort = ['createdAt', 'likesCount'];
    if (!allowedSort.includes(sort)) sort = 'createdAt';
  
    // Construct media filter
    let mediaFilter = '';
    if (filter === 'image') mediaFilter = `AND p."mediaUrl" ~* '\\.(jpg|jpeg|png|gif)$'`;
    else if (filter === 'video') mediaFilter = `AND p."mediaUrl" ~* '\\.(mp4|mov|avi|mkv)$'`;
  
    const query = `
      SELECT 
        p.*,
        u."userID" as "userId",
        u."firstName",
        u."lastName",
        u.email,
        COUNT(DISTINCT l.id) as "likesCount",
        COUNT(DISTINCT c.id) as "commentCount",
        CASE WHEN user_like.id IS NOT NULL THEN true ELSE false END as "isLiked"
      FROM community_post p
      LEFT JOIN "user" u ON u."userID" = p."userId"
      LEFT JOIN post_like l ON l."postId" = p.id AND l."deletedAt" IS NULL
      LEFT JOIN post_comment c ON c."postId" = p.id AND c."deletedAt" IS NULL
      LEFT JOIN post_like user_like ON user_like."postId" = p.id AND user_like."userId" = $2 AND user_like."deletedAt" IS NULL
      WHERE p."communityId" = $1
        AND p."deletedAt" IS NULL
        ${mediaFilter}
      GROUP BY p.id, u."userID", user_like.id
      ORDER BY ${sort === 'likesCount' ? 'COUNT(DISTINCT l.id)' : 'p."createdAt"'} ${order}
      LIMIT $3 OFFSET $4
    `;
  
    const posts = await this.postRepo.query(query, [communityId, userId, limit, offset]);
  
    // Optional: get total count for pagination
    const countQuery = `
      SELECT COUNT(*) 
      FROM community_post p
      WHERE p."communityId" = $1 AND p."deletedAt" IS NULL
      ${mediaFilter}
    `;
    const totalCount = await this.postRepo.query(countQuery, [communityId]);
  
    return {
      data: posts,
      page,
      limit,
      total: parseInt(totalCount[0].count, 10),
      totalPages: Math.ceil(totalCount[0].count / limit),
    };
  }

  async getFeedPosts(
    userId: number,
    page: number = 1,
    limit: number = 10,
    sort: string = 'createdAt',
    order: 'ASC' | 'DESC' = 'DESC',
    filter: string = '',
  ) {
    const offset = (page - 1) * limit;

    const allowedSort = ['createdAt', 'likesCount'];
    if (!allowedSort.includes(sort)) sort = 'createdAt';

    let mediaFilter = '';
    if (filter === 'image') mediaFilter = `AND p."mediaUrl" ~* '\\.(jpg|jpeg|png|gif)$'`;
    else if (filter === 'video') mediaFilter = `AND p."mediaUrl" ~* '\\.(mp4|mov|avi|mkv)$'`;

    const query = `
      SELECT 
        p.*, 
        u."userID" as "userId",
        u."firstName", u."lastName", u.email,
        COUNT(DISTINCT l.id) as "likesCount",
        COUNT(DISTINCT c.id) as "commentCount",
        CASE WHEN user_like.id IS NOT NULL THEN true ELSE false END as "isLiked"
      FROM community_post p
      INNER JOIN community_members cm ON cm."communityId" = p."communityId" AND cm."userId" = $1
      LEFT JOIN "user" u ON u."userID" = p."userId"
      LEFT JOIN post_like l ON l."postId" = p.id AND l."deletedAt" IS NULL
      LEFT JOIN post_comment c ON c."postId" = p.id AND c."deletedAt" IS NULL
      LEFT JOIN post_like user_like ON user_like."postId" = p.id AND user_like."userId" = $1 AND user_like."deletedAt" IS NULL
      WHERE p."deletedAt" IS NULL
        ${mediaFilter}
      GROUP BY p.id, u."userID", user_like.id
      ORDER BY ${sort === 'likesCount' ? 'COUNT(DISTINCT l.id)' : 'p."createdAt"'} ${order}
      LIMIT $2 OFFSET $3
    `;

    const posts = await this.postRepo.query(query, [userId, limit, offset]);

    const countQuery = `
      SELECT COUNT(*)
      FROM community_post p
      INNER JOIN community_members cm ON cm."communityId" = p."communityId" AND cm."userId" = $1
      WHERE p."deletedAt" IS NULL
      ${mediaFilter}
    `;
    const totalCount = await this.postRepo.query(countQuery, [userId]);

    return {
      data: posts,
      page,
      limit,
      total: parseInt(totalCount[0].count, 10),
      totalPages: Math.ceil(totalCount[0].count / limit),
    };
  }

  async toggleLike(postId: number, user: User) {
    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['user', 'community'],
    });    
    if (!post) throw new NotFoundException('Post not found');
  
    const existingLike = await this.likeRepo.findOne({
      where: { post: { id: postId }, user: { userID: user.userID } },
      withDeleted: true,
    });
  
    let isLiked = false;
    let likeCount = 0;

    if (existingLike && !existingLike.deletedAt) {
      // Unlike the post
      await this.likeRepo.softRemove(existingLike);
      isLiked = false;
    } else if (existingLike && existingLike.deletedAt) {
      // Restore the like
      await this.likeRepo.restore(existingLike.id);
      await this.likeRepo.update(existingLike.id, { likedAt: new Date() });
      isLiked = true;
    } else {
      // Create new like
      const like = this.likeRepo.create({ post, user, likedAt: new Date() });
      await this.likeRepo.save(like);
      isLiked = true;
    }

    // Get updated like count
    likeCount = await this.likeRepo.count({ 
      where: { post: { id: post.id }, deletedAt: IsNull() } 
    });

    // Send notification if user liked someone else's post
    if (isLiked && post.user.userID !== user.userID) {
      const notificationDto: CreateNotificationDto = {
        type: NotificationType.POST_LIKED,
        content: `${user.firstName} liked your post`,
        referenceId: post.id,
        referenceType: 'CommunityPost',
        userId: post.user.userID,
      };
      await this.notificationService.createNotification(notificationDto);
    }

    // Emit real-time update to community members (only send likeCount, not isLiked since that's user-specific)
    try {
      this.feedGateway.emitPostUpdate(post.community.id, {
        postId: post.id,
        likeCount,
      });
      console.log(`📝 Emitted like update for post ${post.id}: likeCount=${likeCount}`);
    } catch (err) {
      console.error('Failed to emit like update:', err?.message);
    }

    return { message: isLiked ? 'Post liked' : 'Post unliked', likeCount, isLiked };
  }
  
  async commentOnPost(dto: CreateCommentDto, user: User) {
    const post = await this.postRepo.findOne({
      where: { id: dto.postId },
      relations: ['user', 'community'],
    });
    if (!post) throw new NotFoundException('Post not found');

    let parentComment: PostComment | null = null;
    if (dto.parentId) {
      parentComment = await this.commentRepo.findOne({ where: { id: dto.parentId } });
      if (!parentComment) throw new NotFoundException('Parent comment not found');
    }

    const comment = this.commentRepo.create({
      post: post as CommunityPost,
      user: user as User | undefined,
      content: dto.content,
      parent: parentComment as PostComment | undefined,
    });
    const savedComment = await this.commentRepo.save(comment);

    if (post.user.userID !== user.userID) {
      const notificationDto: CreateNotificationDto = {
        type: NotificationType.POST_COMMENTED,
        content: `${user.firstName} commented on your post`,
        referenceId: post.id,
        referenceType: 'CommunityPost',
        userId: post.user.userID,
      };
      await this.notificationService.createNotification(notificationDto);
    }

    // Emit real-time update to community members
    try {
      this.feedGateway.emitPostUpdate(post.community.id, {
        postId: post.id,
        commentCount: await this.commentRepo.count({ where: { post: { id: post.id }, deletedAt: IsNull() } }),
      });
    } catch (err) {
      console.error('Failed to emit comment update:', err?.message);
    }

    return savedComment;


  }

  async getCommentsByPost(postId: number) {
    return this.commentRepo.find({
      where: { post: { id: postId }, deletedAt: IsNull(), parent: IsNull() },
      relations: ['user', 'replies', 'replies.user'],
      order: { createdAt: 'ASC' },
    });
  }

  async deleteComment(commentId: number, user: User) {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId, deletedAt: IsNull() },
      relations: ['user'],
    });
  
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.user.userID !== user.userID)
      throw new BadRequestException('You can only delete your own comments');
  
    await this.commentRepo.softRemove(comment);
    return { message: 'Comment deleted successfully' };
  }

  async deletePost(postId: number, user: User) {
    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['user'],
    });

    if (!post) throw new NotFoundException('Post not found');
    if (post.user.userID !== user.userID)
      throw new BadRequestException('You can only delete your own post');

    await this.postRepo.softRemove(post);
    return { message: 'Post deleted successfully' };
  }

}
