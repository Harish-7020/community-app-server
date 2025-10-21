import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/modules/shared.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { CommunityModule } from './modules/community/community.module';
import { CommunityMembersModule } from './modules/community-members/community-members.module';
import { CommunityPostModule } from './modules/community-post/community-post.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { NotificationModule } from './modules/notification/notification.module';
import { SearchModule } from './modules/search/search.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads', 
    }),
    SharedModule,
    UserModule,
    AuthModule,
    CommunityModule,
    CommunityMembersModule,
    CommunityPostModule,
    NotificationModule,
    SearchModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
