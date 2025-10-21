'use client';

import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '@/hooks/useNotifications';
import { formatRelativeTime } from '@/utils/date';
import { cn } from '@/lib/utils';

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { data } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute top-12 right-0 w-80 md:w-96 rounded-lg border border-border bg-background shadow-2xl overflow-hidden z-[9999] max-h-[calc(100vh-8rem)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4 bg-background">
        <h3 className="font-bold text-base flex items-center gap-2">
          Notifications
        </h3>
        <div className="flex items-center gap-2">
          {data && data.data.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
            >
              Mark all read
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto bg-background notification-scrollbar">
        {data && data.data.length > 0 ? (
          data.data.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'flex items-start gap-3 border-b p-4 transition-all hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 cursor-pointer group',
                !notification.isRead && 'bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20'
              )}
            >
              <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                <AvatarFallback className="bg-gradient-bg-blue text-white font-bold">
                  {notification.type.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className={cn(
                  "text-sm leading-relaxed",
                  !notification.isRead && "font-semibold"
                )}>{notification.content}</p>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-primary" />
                  {formatRelativeTime(notification.createdAt)}
                </div>
              </div>
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead.mutate(notification.id);
                  }}
                  className="rounded-full hover:bg-green-100 dark:hover:bg-green-950/30 hover:text-green-600"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </motion.div>
          ))
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-bg-purple mx-auto mb-4 flex items-center justify-center">
              <Check className="w-8 h-8 text-white" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">No new notifications</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

