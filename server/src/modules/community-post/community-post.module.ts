import { Module } from '@nestjs/common';
import { CommunityPostService } from './community-post.service';
import { CommunityPostController } from './community-post.controller';
import { FeedGateway } from './feed.gateway';
import { SharedModule } from 'src/shared/modules/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [CommunityPostController],
  providers: [CommunityPostService, FeedGateway],
  exports: [CommunityPostService, FeedGateway],
})
export class CommunityPostModule {}
