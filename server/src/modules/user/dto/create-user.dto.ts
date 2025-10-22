import {
    IsEmail,
    IsOptional,
    IsString,
    MaxLength,
  } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
  
  export class CreateUserDto {
  
      @ApiProperty({
        description: 'User first name',
        example: 'John',
        maxLength: 25,
      })
      @IsString()
      @MaxLength(25)
      firstName: string;
  
      @ApiProperty({
        description: 'User last name',
        example: 'Doe',
        maxLength: 25,
      })
      @IsString()
      @MaxLength(25)
      lastName: string;
  
      @ApiProperty({
        description: 'User email address',
        example: 'john.doe@example.com',
        maxLength: 50,
      })
      @IsEmail()
      @MaxLength(50)
      email: string;
  
      @ApiProperty({
        description: 'User password',
        example: 'password123',
        maxLength: 50,
      })
      @IsString()
      @MaxLength(50)
      password: string;

      @ApiProperty({
        description: 'User bio/about me',
        example: 'Software developer passionate about technology',
        maxLength: 500,
        required: false,
      })
      @IsOptional()
      @IsString()
      @MaxLength(500)
      aboutMe?: string;
    
      @ApiProperty({
        description: 'Profile picture URL',
        example: '/uploads/profile-pictures/profile.jpg',
        maxLength: 255,
        required: false,
      })
      @IsOptional()
      @IsString()
      @MaxLength(255)
      profilePicture?: string;
  
  }
  