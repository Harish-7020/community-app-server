import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from 'src/shared/entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationGateway } from './notification.gateway';
import { User } from 'src/shared/entities/user.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly gateway: NotificationGateway,
  ) {}

  async createNotification(dto: CreateNotificationDto) {
    const user = await this.userRepo.findOne({ where: { userID: dto.userId } });
    if (!user) throw new NotFoundException('Recipient user not found');

    const entity = this.notificationRepo.create({
      type: dto.type,
      content: dto.content,
      referenceId: dto.referenceId,
      referenceType: dto.referenceType,
      user,
      isRead: false,
    });

    const saved = await this.notificationRepo.save(entity);

    try {
      this.gateway.emitToUser(user.userID, {
        id: saved.id,
        type: saved.type,
        content: saved.content,
        referenceId: saved.referenceId,
        referenceType: saved.referenceType,
        isRead: saved.isRead,
        createdAt: saved.createdAt,
      });
    } catch (err) {
        console.error('Failed to emit notification:', err?.message);
    }

    return saved;
  }

  async getNotifications(userId: number, page = 1, limit = 20, unread?: boolean) {
    const offset = (page - 1) * limit;

    const qb = this.notificationRepo
      .createQueryBuilder('n')
      .leftJoinAndSelect('n.user', 'user')
      .where('n.userId = :userId', { userId })
      .orderBy('n.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    if (unread === true) {
      qb.andWhere('n.isRead = false');
    }

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsRead(notificationId: number, userId: number) {
    const notif = await this.notificationRepo.findOne({
      where: { id: notificationId },
      relations: ['user'],
    });
    if (!notif || notif.user.userID !== userId) throw new NotFoundException('Notification not found');
    notif.isRead = true;
    return this.notificationRepo.save(notif);
  }

  async markAllAsRead(userId: number) {
    await this.notificationRepo
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true })
      .where('userId = :userId', { userId })
      .andWhere('isRead = false')
      .execute();

    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId: number) {
    const count = await this.notificationRepo.count({ where: { user: { userID: userId }, isRead: false } });
    return { 'unread-count': count };
  }

  async removeNotification(notificationId: number, userId: number) {
    const data = await this.notificationRepo.findOne({
      where: { id: notificationId },
      relations: ['user'],
    });
    if (!data || data.user.userID !== userId) throw new NotFoundException('Notification not found');
    await this.notificationRepo.softRemove(data);
    return { message: 'Notification removed' };
  }
}
