'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PostCard } from '@/components/PostCard/PostCard';
import { usePost, usePostComments, useAddComment } from '@/hooks/usePosts';
import { commentSchema, CommentInput } from '@/lib/validations';
import { formatRelativeTime } from '@/utils/date';
import { getInitials } from '@/utils/formatter';
import Link from 'next/link';

export default function PostDetailPage() {
  const params = useParams();
  const postId = Number(params.id);

  const { data: post, isLoading: postLoading } = usePost(postId);
  const { data: comments, isLoading: commentsLoading } = usePostComments(postId);
  const addCommentMutation = useAddComment();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
  });

  const onSubmit = (data: CommentInput) => {
    addCommentMutation.mutate(
      { postId, content: data.content },
      {
        onSuccess: () => {
          reset();
        },
      }
    );
  };

  if (postLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Post */}
      <PostCard post={post} />

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Comments ({comments?.length || 0})</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Comment Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <Textarea
              placeholder="Write a comment..."
              rows={3}
              {...register('content')}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={addCommentMutation.isPending}
            >
              <Send className="mr-2 h-4 w-4" />
              {addCommentMutation.isPending ? 'Posting...' : 'Comment'}
            </Button>
          </form>

          {/* Comments List */}
          {commentsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 rounded-lg border p-4"
                >
                  <Link href={`/profile/${comment.user.userID}`}>
                    <Avatar>
                      {comment.user.profilePicture ? (
                        <AvatarImage src={comment.user.profilePicture} />
                      ) : (
                        <AvatarFallback>
                          {getInitials(comment.user.firstName, comment.user.lastName)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/profile/${comment.user.userID}`}
                        className="font-semibold hover:underline"
                      >
                        {comment.user.firstName} {comment.user.lastName}
                      </Link>
                      <span className="text-sm text-muted-foreground">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No comments yet. Be the first to comment!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

