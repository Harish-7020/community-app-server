import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Post ID to comment on',
    example: 1,
  })
  @IsNotEmpty()
  postId: number;

  @ApiProperty({
    description: 'Comment content',
    example: 'This is a great post!',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Parent comment ID for replies',
    example: 1,
    required: false,
  })
  @IsOptional()
  parentId?: number;
}
