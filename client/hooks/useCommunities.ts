import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityService } from '@/services/community.service';
import { Community } from '@/types';

export const useCommunities = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['communities', page, limit],
    queryFn: () => communityService.getAll(page, limit),
  });
};

export const useCommunity = (id: number) => {
  return useQuery({
    queryKey: ['community', id],
    queryFn: () => communityService.getById(id),
    enabled: !!id,
  });
};

export const useCreateCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      communityService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
};

export const useJoinCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => communityService.join(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['community'] });
    },
  });
};

export const useLeaveCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => communityService.leave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['community'] });
    },
  });
};

