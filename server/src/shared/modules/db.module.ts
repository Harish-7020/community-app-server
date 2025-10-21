import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as config from 'dotenv';
import { User } from '../entities/user.entity';
import { Community } from '../entities/community.entity';
import { CommunityMember } from '../entities/community-member.entity';
import { CommunityPost } from '../entities/community-post.entity';
import { PostLike } from '../entities/post-like.entity';
import { PostComment } from '../entities/post-comment.entity';
import { Notification } from '../entities/notification.entity';

config.config();
  
  const entities = [
    User,
    Community,
    CommunityMember,
    CommunityPost,
    PostLike,
    PostComment,
    Notification

  ]
  @Module({
    imports: [
      TypeOrmModule.forRoot({
        type: process.env.DATABASE as any,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        // logging: true,
        entities: entities,
        synchronize: true,
        logging: false,
        requestTimeout: 60000,
        pool: {
          max: 1000, // Max number of connections
          min: 2, // Min number of connections
          idleTimeoutMillis: 30000, // How long a connection can sit idle before being released (30 seconds)
        },
        extra: {
          trustServerCertificate: true,
          connectionTimeoutMillis: 50000,
        },
      }),
      TypeOrmModule.forFeature(entities)
    ],
    exports: [TypeOrmModule]
  })
  export class DbModule { }
  