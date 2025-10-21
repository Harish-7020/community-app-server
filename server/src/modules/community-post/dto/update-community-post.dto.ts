// src/modules/community-post/dto/update-community-post.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdateCommunityPostDto {
  @IsOptional()
  @IsString()
  content?: string;

}
