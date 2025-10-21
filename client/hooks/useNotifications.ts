import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import { useNotificationStore } from '@/store/useNotificationStore';

export const useNotifications = (page = 1, limit = 20) => {
  const { setNotifications } = useNotificationStore();

  return useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: async () => {
      const data = await notificationService.getAll(page, limit);
      if (page === 1) {
        setNotifications(data.data);
      }
      return data;
    },
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const { markAsRead, removeNotification } = useNotificationStore();

  return useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: (_, id) => {
      markAsRead(id);
      // Immediately remove from local state
      removeNotification(id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  const { markAllAsRead, notifications } = useNotificationStore();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      markAllAsRead();
      // Only clear READ notifications from local state, keep unread ones
      const unreadNotifications = notifications.filter(n => !n.isRead);
      useNotificationStore.getState().setNotifications(unreadNotifications);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

