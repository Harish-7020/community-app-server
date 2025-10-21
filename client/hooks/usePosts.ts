import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '@/services/post.service';

export const usePosts = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['posts', page, limit],
    queryFn: () => postService.getAll(page, limit),
  });
};

export const usePost = (id: number) => {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => postService.getById(id),
    enabled: !!id,
  });
};

export const useCommunityPosts = (communityId: number, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['posts', 'community', communityId, page, limit],
    queryFn: () => postService.getByCommunity(communityId, page, limit),
    enabled: !!communityId,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { communityId: number; content: string; mediaUrl?: string }) =>
      postService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => postService.like(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
    },
  });
};

export const useUnlikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => postService.unlike(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
    },
  });
};

export const usePostComments = (postId: number) => {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => postService.getComments(postId),
    enabled: !!postId,
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, content }: { postId: number; content: string }) =>
      postService.addComment(postId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

