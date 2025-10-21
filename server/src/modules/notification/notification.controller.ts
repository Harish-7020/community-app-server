import {
    Controller,
    Get,
    Query,
    UseGuards,
    Req,
    Patch,
    Param,
    Post,
    Body,
    Delete,
  } from '@nestjs/common';
  import { NotificationService } from './notification.service';
  import { AuthGuard } from 'src/shared/guards/auth.guard';
  import { GetNotificationsDto } from './dto/get-notifications.dto';
  import { CreateNotificationDto } from './dto/create-notification.dto';
  
  @Controller('notifications')
  @UseGuards(AuthGuard)
  export class NotificationController {
    constructor(private readonly service: NotificationService) {}
  
    @Get()
    async getNotifications(@Req() req, @Query() q: GetNotificationsDto) {
      const userId = req.user.userID;
      const { page = 1, limit = 20, unread } = q;
      return this.service.getNotifications(userId, page, limit, unread);
    }
  
    @Patch(':id/read')
    async markAsRead(@Param('id') id: number, @Req() req) {
      const userId = req.user.userID;
      return this.service.markAsRead(Number(id), userId);
    }
  
    @Patch('read-all')
    async markAllAsRead(@Req() req) {
      const userId = req.user.userID;
      return this.service.markAllAsRead(userId);
    }

    @Get('unread-count')
    async getUnreadCount(@Req() req) {
    const userId = req.user.userID;
    return this.service.getUnreadCount(userId);
    }

    @Delete(':id')
    async remove(@Param('id') id: number, @Req() req) {
      const userId = req.user.userID;
      return this.service.removeNotification(Number(id), userId);
    }
  
    @Post()
    async createNotification(@Body() dto: CreateNotificationDto) {
      return this.service.createNotification(dto);
    }
  }
  