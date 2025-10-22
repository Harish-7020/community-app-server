import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommunityDto {
  @ApiProperty({
    description: 'Community name',
    example: 'Tech Enthusiasts',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Community description',
    example: 'A community for technology enthusiasts to share ideas and discuss latest trends',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
