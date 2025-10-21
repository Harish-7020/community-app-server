import { api } from '@/lib/api';
import { Community, PaginatedResponse } from '@/types';

export const communityService = {
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Community>> => {
    const response = await api.get('/community', { params: { page, limit } });
    // Backend wraps response in { success, data, statusCode }
    // The data is an array of communities
    const communities = response.data.data || response.data;
    return {
      data: communities,
      page: 1,
      limit: communities.length,
      totalCount: communities.length,
      totalPages: 1
    };
  },

  getById: async (id: number): Promise<Community> => {
    const response = await api.get(`/community/${id}`);
    // Backend wraps response in { success, data, statusCode }
    return response.data.data || response.data;
  },

  create: async (data: { name: string; description?: string }): Promise<Community> => {
    const response = await api.post('/community', data);
    // Backend wraps response in { success, data, statusCode }
    return response.data.data || response.data;
  },

  update: async (id: number, data: Partial<Community>): Promise<Community> => {
    const response = await api.put(`/community/${id}/update`, data);
    // Backend wraps response in { success, data, statusCode }
    return response.data.data || response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.put(`/community/${id}/delete`);
  },

  join: async (id: number): Promise<void> => {
    await api.post(`/members/join/${id}`);
  },

  leave: async (id: number): Promise<void> => {
    await api.post(`/members/leave/${id}`);
  },

  getMembers: async (id: number): Promise<any[]> => {
    const response = await api.get(`/members/community/${id}`);
    return response.data.data || response.data;
  },
};

