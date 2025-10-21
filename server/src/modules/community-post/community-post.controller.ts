import {
  Controller,
  Post,
  Get,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Body,
  Param,
  Request,
  Patch,
  Req,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { multerConfig } from 'src/shared/config/multer.config';
import { CommunityPostService } from './community-post.service';
import { CreateCommunityPostDto } from './dto/create-community-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommunityPostDto } from './dto/update-community-post.dto';

@Controller('post')
@UseGuards(AuthGuard)
export class CommunityPostController {
  constructor(private readonly postService: CommunityPostService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async createPost(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateCommunityPostDto,
    @Request() req,
  ) {
    const mediaUrl = file ? file.path : undefined;
    return this.postService.createPost(dto, req.user, mediaUrl);
  }

  @Post('update/:postId')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async updatePost(
    @Param('postId') postId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateCommunityPostDto,
    @Req() req: any,
  ) {
    const mediaUrl = file ? file.path : undefined;
    return this.postService.updatePost(postId, req.user, dto, mediaUrl);
  }

  @Get(':communityId')
  async getPosts(
    @Param('communityId') communityId: number,
    @Req() req: any,
  ) {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'DESC', filter = '' } = req.query;
    return this.postService.getPostsByCommunity(
      communityId,
      req.user.userID,
      Number(page),
      Number(limit),
      sort,
      order.toUpperCase(),
      filter,
    );
  }

  @Get('feed/me')
  async getMyFeed(@Req() req: any) {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'DESC', filter = '' } = req.query;
    return this.postService.getFeedPosts(
      req.user.userID,
      Number(page),
      Number(limit),
      sort,
      order.toUpperCase(),
      filter,
    );
  }

  @Patch(':id/like')
  async toggleLike(@Param('id') id: number, @Req() req: any) {
    return this.postService.toggleLike(id, req.user);
  }

  @Post('comment')
  async commentOnPost(@Body() dto: CreateCommentDto, @Req() req: any) {
    return this.postService.commentOnPost(dto, req.user);
  }

  @Post('comment/:id')
  async deleteComment(@Param('id') id: number, @Req() req: any) {
    return this.postService.deleteComment(id, req.user);
  }

  @Get(':postId/comments')
  async getCommentsByPost(@Param('postId') postId: number) {
    return this.postService.getCommentsByPost(postId);
  }

  @Delete(':id')
  async deletePost(@Param('id') id: number, @Req() req: any) {
    return this.postService.deletePost(id, req.user);
  }
  
}
