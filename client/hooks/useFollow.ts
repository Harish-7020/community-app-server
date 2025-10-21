import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';

export const useFollow = (userId: number) => {
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: () => userService.follow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['isFollowing', userId] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => userService.unfollow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['isFollowing', userId] });
    },
  });

  return {
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    isFollowing: followMutation.isPending,
    isUnfollowing: unfollowMutation.isPending,
  };
};

export const useIsFollowing = (userId: number) => {
  return useQuery({
    queryKey: ['isFollowing', userId],
    queryFn: () => userService.isFollowing(userId),
    enabled: !!userId,
  });
};

