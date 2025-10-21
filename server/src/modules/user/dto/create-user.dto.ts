import {
    IsEmail,
    IsOptional,
    IsString,
    MaxLength,
  } from 'class-validator';
  
  export class CreateUserDto {
  
      @IsString()
      @MaxLength(25)
      firstName: string;
  
      @IsString()
      @MaxLength(25)
      lastName: string;
  
      @IsEmail()
      @MaxLength(50)
      email: string;
  
      @IsString()
      @MaxLength(50)
      password: string;

      @IsOptional()
      @IsString()
      @MaxLength(500)
      aboutMe?: string;
    
      @IsOptional()
      @IsString()
      @MaxLength(255)
      profilePicture?: string;
  
  }
  