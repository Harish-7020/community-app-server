import { IsEmail, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  @IsEmail()
  username?: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    maxLength: 100,
  })
  @MaxLength(100)
  @IsString()
  password?: string;
}
