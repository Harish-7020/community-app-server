import { IsEnum, IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum SearchType {
  ALL = 'all',
  USER = 'user',
  COMMUNITY = 'community',
  POST = 'post',
}

export class SearchQueryDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsEnum(SearchType)
  @IsOptional()
  type: SearchType = SearchType.ALL;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  page = 1;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  limit = 10;
}
