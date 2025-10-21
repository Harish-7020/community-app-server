import { api } from '@/lib/api';
import { Notification, PaginatedResponse } from '@/types';

export const notificationService = {
  getAll: async (page = 1, limit = 20): Promise<PaginatedResponse<Notification>> => {
    const response = await api.get('/notifications', { params: { page, limit } });
    return response.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },
};

