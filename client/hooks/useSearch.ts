import { useQuery } from '@tanstack/react-query';
import { searchService } from '@/services/search.service';
import { SearchType } from '@/types';

export const useSearch = (
  query: string,
  type: SearchType = SearchType.ALL,
  page = 1,
  limit = 10
) => {
  return useQuery({
    queryKey: ['search', query, type, page, limit],
    queryFn: () => searchService.search(query, type, page, limit),
    enabled: query.length > 0,
  });
};

