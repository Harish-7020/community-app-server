import { api } from '@/lib/api';
import { User, PaginatedResponse } from '@/types';

export const userService = {
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/users', { params: { page, limit } });
    // Backend wraps response in { success, data, statusCode }
    return response.data.data || response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    // Backend wraps response in { success, data, statusCode }
    return response.data.data || response.data;
  },

  updateProfile: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    // Backend wraps response in { success, data, statusCode }
    return response.data.data || response.data;
  },

  uploadProfilePicture: async (file: File, userId: number): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    const response = await api.patch(`/users/${userId}/profile-picture`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // Backend wraps response in { success, data, statusCode }
    return response.data.data || response.data;
  },

  follow: async (userId: number): Promise<{ success: boolean }> => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data.data || response.data;
  },

  unfollow: async (userId: number): Promise<{ success: boolean }> => {
    const response = await api.post(`/users/${userId}/unfollow`);
    return response.data.data || response.data;
  },

  isFollowing: async (userId: number): Promise<{ isFollowing: boolean }> => {
    const response = await api.get(`/users/${userId}/is-following`);
    return response.data.data || response.data;
  },
};

