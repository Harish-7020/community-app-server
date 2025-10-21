import { api } from '@/lib/api';
import { CommunityPost, PaginatedResponse, PostComment } from '@/types';

export const postService = {
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<CommunityPost>> => {
    try {
      // Fetch posts from communities the user belongs to
      const response = await api.get('/post/feed/me', { params: { page, limit } });
      console.log('Posts API response:', { 
        raw: response.data, 
        status: response.status,
        headers: response.headers 
      });
      
      // Backend returns the data directly from the service
      const result = response.data;
      console.log('Processed result:', result);
      
      return result;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<CommunityPost> => {
    const response = await api.get(`/post/${id}`);
    // Backend wraps response in { success, data, statusCode }
    return response.data.data || response.data;
  },

  getByCommunity: async (
    communityId: number,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<CommunityPost>> => {
    const response = await api.get(`/post/${communityId}`, {
      params: { page, limit },
    });
    // Backend wraps response in { success, data, statusCode }
    return response.data.data || response.data;
  },

  create: async (data: {
    communityId: number;
    content: string;
    mediaUrl?: string;
  }): Promise<CommunityPost> => {
    const response = await api.post('/post/create', data);
    // Backend wraps response in { success, data, statusCode }
    return response.data.data || response.data;
  },

  update: async (id: number, data: Partial<CommunityPost>): Promise<CommunityPost> => {
    const response = await api.post(`/post/update/${id}`, data);
    // Backend wraps response in { success, data, statusCode }
    return response.data.data || response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/post/${id}`);
  },

  like: async (postId: number): Promise<void> => {
    await api.patch(`/post/${postId}/like`);
  },

  unlike: async (postId: number): Promise<void> => {
    await api.patch(`/post/${postId}/like`);
  },

  getComments: async (postId: number): Promise<PostComment[]> => {
    const response = await api.get(`/post/${postId}/comments`);
    // Backend wraps response in { success, data, statusCode }
    return response.data.data || response.data;
  },

  addComment: async (postId: number, content: string): Promise<PostComment> => {
    const response = await api.post('/post/comment', { postId, content });
    // Backend wraps response in { success, data, statusCode }
    return response.data.data || response.data;
  },

  uploadMedia: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/community-posts/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

