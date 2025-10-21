import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommunityPostDto {
  @IsNotEmpty()
  @IsString()
  communityId: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  mediaUrl?: string;
}
