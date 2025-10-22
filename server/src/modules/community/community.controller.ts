import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Req,
  } from '@nestjs/common';
  import { CommunityService } from './community.service';
  import { CreateCommunityDto } from './dto/create-community.dto';
  import { UpdateCommunityDto } from './dto/update-community.dto';
  import { AuthGuard } from 'src/shared/guards/auth.guard';
  import { constructResponse } from '../../shared/utils/helpers';
  import { ApiTags } from '@nestjs/swagger';
  
  @ApiTags('Communities')
@Controller('community')
  @UseGuards(AuthGuard)
  export class CommunityController {
    constructor(private readonly communityService: CommunityService) {}
  
  @Post()
    async createCommunity(@Body() dto: CreateCommunityDto, @Req() req: any) {
      const result = await this.communityService.createCommunity(dto, req.user.userID);
      return constructResponse(true, result, 201);
    }
  
  @Get()
  async getAllCommunities(@Req() req: any) {
    const result = await this.communityService.getAllCommunities(req.user?.userID);
      return constructResponse(true, result, 200);
    }
  
  @Get(':id')
  async getCommunityById(@Param('id') id: number, @Req() req: any) {
    const result = await this.communityService.getCommunityById(id, req.user?.userID);
      return constructResponse(true, result, 200);
    }
  
  @Put(':id/update')
    async updateCommunity(
      @Param('id') id: number,
      @Body() dto: UpdateCommunityDto,
      @Req() req: any,
    ) {
      const result = await this.communityService.updateCommunity(id, dto, req.user.userID);
      return constructResponse(true, result, 200);
    }
  
  @Put(':id/delete')
    async deleteCommunity(@Param('id') id: number, @Req() req: any) {
      const result = await this.communityService.deleteCommunity(id, req.user.userID);
      return constructResponse(true, result, 200);
    }
  }
  