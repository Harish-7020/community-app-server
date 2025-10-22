import { IsEmail, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {

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
  @MaxLength(50)
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    maxLength: 15,
  })
  @IsString()
  @MaxLength(15)
  password: string;
}
