import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { NotificationType } from 'src/shared/enum/notification.type';

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  @IsOptional()
  content?: string;

  @IsInt()
  @IsOptional()
  referenceId?: number;

  @IsString()
  @IsOptional()
  referenceType?: string;

  @IsInt()
  userId: number; // recipient user id
}
