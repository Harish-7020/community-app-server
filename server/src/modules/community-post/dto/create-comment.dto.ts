import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  postId: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  parentId?: number;
}
