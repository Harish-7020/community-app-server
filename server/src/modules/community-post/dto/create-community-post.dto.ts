import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommunityPostDto {
  @ApiProperty({
    description: 'Community ID where the post will be created',
    example: '1',
  })
  @IsNotEmpty()
  @IsString()
  communityId: string;

  @ApiProperty({
    description: 'Post content',
    example: 'This is an interesting post about technology trends!',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Media URL (image/video)',
    example: '/uploads/posts/image.jpg',
    required: false,
  })
  @IsOptional()
  mediaUrl?: string;
}
