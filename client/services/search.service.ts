import { api } from '@/lib/api';
import { SearchType, PaginatedResponse, SearchResult } from '@/types';

export const searchService = {
  search: async (
    query: string,
    type: SearchType = SearchType.ALL,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<SearchResult>> => {
    const response = await api.get('/search', {
      params: { query, type, page, limit },
    });
    // Backend wraps response in { success, data, statusCode }
    return response.data.data || response.data;
  },
};

