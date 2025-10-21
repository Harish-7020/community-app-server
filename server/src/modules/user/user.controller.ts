import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Put, UploadedFile, UseGuards, UseInterceptors, Request } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { profilePictureMulterConfig } from 'src/shared/config/multer.config';
import { constructResponse } from '../../shared/utils/helpers';

@Controller('users')
@UseGuards(AuthGuard)
export class UserController {

    constructor(private readonly userService: UserService) {}

    @Post()
    @UseInterceptors(FileInterceptor('profilePicture', profilePictureMulterConfig))
    async createUser(
      @UploadedFile() file: Express.Multer.File,
      @Body() createUserDto: CreateUserDto
    ) {
      if (file) {
        createUserDto.profilePicture = file.path;
      }
      const result = await this.userService.createUser(createUserDto);
      return constructResponse(true, result, 201);
    }

    @Put(':id')
    async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        const result = await this.userService.updateUser(Number(id), updateUserDto);
        return constructResponse(true, result, 200);
    }

    @Patch(':id/profile-picture')
    @UseInterceptors(FileInterceptor('profilePicture', profilePictureMulterConfig))
    async updateProfilePicture(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
      if (!file) throw new BadRequestException('No file uploaded');
      const result = await this.userService.updateProfilePicture(Number(id), file.path);
      return constructResponse(true, result, 200);
    }

    @Get(':id')
    async getUser(@Param('id') id: string) {
        const result = await this.userService.getUserById(Number(id));
        return constructResponse(true, result, 200);
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: string) {
        const result = await this.userService.deleteUser(Number(id));
        return constructResponse(true, result, 200);
    }

    @Get()
    async getUsers() {
        const result = await this.userService.getUsers();
        return constructResponse(true, result, 200);
    }

    @Post(':id/follow')
    async followUser(@Param('id') id: string, @Request() req: any) {
        const result = await this.userService.followUser(req.user.userID, Number(id));
        return constructResponse(true, result, 200);
    }

    @Post(':id/unfollow')
    async unfollowUser(@Param('id') id: string, @Request() req: any) {
        const result = await this.userService.unfollowUser(req.user.userID, Number(id));
        return constructResponse(true, result, 200);
    }

    @Get(':id/is-following')
    async isFollowing(@Param('id') id: string, @Request() req: any) {
        const result = await this.userService.isFollowing(req.user.userID, Number(id));
        return constructResponse(true, result, 200);
    }
}
