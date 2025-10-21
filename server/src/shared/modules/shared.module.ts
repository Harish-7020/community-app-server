import { Module } from "@nestjs/common";
import { DbModule } from "./db.module";
import { UserService } from "src/modules/user/user.service";
import { JWTService } from "../services/jwt.service";
import { AuthService } from "../../modules/auth/auth.service";
import { CommunityService } from "src/modules/community/community.service";
import { CommunityMembersService } from "src/modules/community-members/community-members.service";
import { CommunityPostService } from "src/modules/community-post/community-post.service";
import { NotificationService } from "src/modules/notification/notification.service";
import { NotificationGateway } from "src/modules/notification/notification.gateway";
import { FeedGateway } from "src/modules/community-post/feed.gateway";

const MODULES = [
    DbModule
]

const SERVICES = [
   UserService,
   JWTService,
   AuthService,
   CommunityService,
   CommunityMembersService,
   CommunityPostService,
   NotificationGateway,
   FeedGateway,
   NotificationService,
]

@Module({
    imports: [...MODULES],
    controllers: [],
    providers: [...SERVICES],
    exports: [...MODULES, ...SERVICES]
})
export class SharedModule { }

