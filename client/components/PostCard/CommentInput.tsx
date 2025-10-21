'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/useAuthStore';
import { useAddComment, usePostComments } from '@/hooks/usePosts';
import { getInitials, formatNumber } from '@/utils/formatter';
import { formatRelativeTime } from '@/utils/date';

interface CommentInputProps {
  postId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function CommentInput({ postId, isOpen, onClose }: CommentInputProps) {
  const [content, setContent] = useState('');
  const { user } = useAuthStore();
  const addComment = useAddComment();
  const { data: commentsData, isLoading } = usePostComments(postId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await addComment.mutateAsync({ postId, content: content.trim() });
      setContent('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="border-t border-border"
        >
          {/* Comments List - Instagram Style */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading comments...
              </div>
            ) : commentsData && commentsData.length > 0 ? (
              <div className="p-3 space-y-3">
                {commentsData.map((comment: any, index: number) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-3"
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      {comment.user?.profilePicture ? (
                        <AvatarImage src={comment.user.profilePicture} alt={comment.user.firstName} />
                      ) : (
                        <AvatarFallback className="bg-gradient-bg-blue text-white text-xs font-semibold">
                          {getInitials(comment.user?.firstName, comment.user?.lastName)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          {comment.user?.firstName} {comment.user?.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed break-words">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors">
                          <Heart className="h-3 w-3" />
                          <span>{formatNumber(comment.likeCount || 0)}</span>
                        </button>
                        <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
                          Reply
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>

          {/* Comment Input */}
          <div className="border-t border-border p-3">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                {user?.profilePicture ? (
                  <AvatarImage src={user.profilePicture} alt={user.firstName} />
                ) : (
                  <AvatarFallback className="bg-gradient-bg-blue text-white text-xs font-semibold">
                    {getInitials(user?.firstName, user?.lastName)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!content.trim() || addComment.isPending}
                  className="px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}