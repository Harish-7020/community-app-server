import { IsOptional, IsString } from 'class-validator';

export class UpdateCommunityDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
