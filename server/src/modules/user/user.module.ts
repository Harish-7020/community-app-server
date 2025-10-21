import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SharedModule } from '../../shared/modules/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}