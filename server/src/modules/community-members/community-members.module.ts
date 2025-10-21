import { Module } from '@nestjs/common';
import { CommunityMembersController } from './community-members.controller';
import { CommunityMembersService } from './community-members.service';
import { SharedModule } from 'src/shared/modules/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [CommunityMembersController],
  providers: [CommunityMembersService],
  exports: [CommunityMembersService],
})
export class CommunityMembersModule {}
