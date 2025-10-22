import {
    Controller,
    Post,
    Delete,
    Get,
    Param,
    Req,
    UseGuards,
  } from '@nestjs/common';
  import { CommunityMembersService } from './community-members.service';
  import { AuthGuard } from 'src/shared/guards/auth.guard';
  import { ApiTags } from '@nestjs/swagger';
  
  @ApiTags('Community Members')
  @Controller('members')
  @UseGuards(AuthGuard)
  export class CommunityMembersController {
    constructor(private readonly membersService: CommunityMembersService) {}
  
    @Post('join/:communityId')
    async joinCommunity(@Param('communityId') id: number, @Req() req: any) {
      return this.membersService.joinCommunity(id, req.user.userID);
    }
  
    @Post('leave/:communityId')
    async leaveCommunity(@Param('communityId') id: number, @Req() req: any) {
      return this.membersService.leaveCommunity(id, req.user.userID);
    }
  
    @Get('community/:communityId')
    async getCommunityMembers(@Param('communityId') id: number) {
      return this.membersService.getCommunityMembers(id);
    }
  
    @Get('user')
    async getUserCommunities(@Req() req: any) {
      return this.membersService.getUserCommunities(req.user.userID);
    }
  }
  