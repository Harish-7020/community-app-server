'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, Maximize2, UserPlus, UserCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MediaModal } from '@/components/Modals/MediaModal';
import { ShareModal } from '@/components/Modals/ShareModal';
import { CommentInput } from './CommentInput';
import { CommunityPost } from '@/types';
import { useLikePost, useUnlikePost } from '@/hooks/usePosts';
import { useFollow } from '@/hooks/useFollow';
import { useAuthStore } from '@/store/useAuthStore';
import { useFeedSocket } from '@/hooks/useFeedSocket';
import { formatRelativeTime } from '@/utils/date';
import { formatNumber, getInitials } from '@/utils/formatter';

interface PostCardProps {
  post: CommunityPost;
}

export function PostCard({ post }: PostCardProps) {
  const { user: currentUser } = useAuthStore();
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [isAnimatingLike, setIsAnimatingLike] = useState(false);
  
  const likeMutation = useLikePost();
  const unlikeMutation = useUnlikePost();
  const feedSocket = useFeedSocket();

  // Sync local state with post prop when it changes (e.g., on page refresh)
  useEffect(() => {
    console.log('🔄 PostCard: Syncing state with post data for post', post.id, {
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      isLiked: post.isLiked,
      'post object': post
    });
    setLiked(post.isLiked || false);
    setLikeCount(post.likeCount || 0);
    setCommentCount(post.commentCount || 0);
    console.log('🔄 PostCard: After sync - liked:', post.isLiked || false, 'likeCount:', post.likeCount || 0);
  }, [post.id, post.likeCount, post.commentCount, post.isLiked]);

  // Listen for real-time updates for this specific post
  // NOTE: We only update likeCount and commentCount, NOT isLiked (user-specific)
  useEffect(() => {
    if (!feedSocket) {
      console.log('🔌 PostCard: No feedSocket available for post', post.id);
      return;
    }

    const handlePostUpdate = (updateData: { postId: number; likeCount?: number; commentCount?: number }) => {
      console.log('📝 PostCard: Received post update for post', post.id, 'data:', updateData);
      console.log('📝 PostCard: Current likeCount state:', likeCount);
      console.log('📝 PostCard: Current commentCount state:', commentCount);
      if (updateData.postId === post.id) {
        if (updateData.likeCount !== undefined) {
          console.log('👍 PostCard: Updating like count from', likeCount, 'to', updateData.likeCount);
          setLikeCount(updateData.likeCount);
          console.log('👍 PostCard: Like count updated successfully');
        }
        if (updateData.commentCount !== undefined) {
          console.log('💬 PostCard: Updating comment count from', commentCount, 'to', updateData.commentCount);
          setCommentCount(updateData.commentCount);
          console.log('💬 PostCard: Comment count updated successfully');
        }
        // Don't update isLiked from WebSocket - it's user-specific and handled by the user's own actions
      } else {
        console.log('📝 PostCard: Update not for this post, ignoring');
      }
    };

    console.log('🔌 PostCard: Setting up socket listener for post', post.id);
    feedSocket.on('post_updated', handlePostUpdate);

    return () => {
      console.log('🔌 PostCard: Cleaning up socket listener for post', post.id);
      feedSocket.off('post_updated', handlePostUpdate);
    };
  }, [feedSocket, post.id, likeCount, commentCount]);
  
  // Safely get the user ID - handle both post.user and direct user data
  const postUserId = post.user?.userID || (post as { userID?: number }).userID;
  const { follow, unfollow } = useFollow(postUserId || 0);
  
  // Debouncing refs
  const likeDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const followDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced like handler with animation
  const handleLike = useCallback(() => {
    if (likeDebounceRef.current) return; // Prevent double clicks
    if (likeMutation.isPending || unlikeMutation.isPending) return; // Prevent multiple requests
    
    setIsAnimatingLike(true);
    setTimeout(() => setIsAnimatingLike(false), 500);
    
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);

    likeDebounceRef.current = setTimeout(() => {
      // Use the toggle endpoint for both like and unlike
      likeMutation.mutate(post.id, {
        onError: (error) => {
          console.error('Like/Unlike failed:', error);
          // Revert optimistic update on error
          setLiked(!newLikedState);
          setLikeCount(prev => newLikedState ? prev - 1 : prev + 1);
        }
      });
      likeDebounceRef.current = null;
    }, 300);
  }, [liked, post.id, likeMutation, unlikeMutation]);

  // Debounced follow handler
  const handleFollow = useCallback(() => {
    if (followDebounceRef.current) return; // Prevent double clicks
    
    const newFollowingState = !isFollowing;
    setIsFollowing(newFollowingState);

    followDebounceRef.current = setTimeout(() => {
      if (newFollowingState) {
        follow();
      } else {
        unfollow();
      }
      followDebounceRef.current = null;
    }, 300);
  }, [isFollowing, follow, unfollow]);

  // Share handler - open modal
  const handleShare = useCallback(() => {
    setShowShareModal(true);
  }, []);

  // Comment handler - toggle input
  const handleComment = useCallback(() => {
    setShowCommentInput((prev) => !prev);
  }, []);

  // Handle comment close and update count
  const handleCommentClose = useCallback(() => {
    setShowCommentInput(false);
    setCommentCount((prev) => prev + 1);
  }, []);

  // Safely get user data - handle both post.user and direct user data
  const postUser = post.user || {
    userID: (post as { userID?: number }).userID,
    firstName: (post as { firstName?: string }).firstName,
    lastName: (post as { lastName?: string }).lastName,
    profilePicture: (post as { profilePicture?: string }).profilePicture,
  };

  const isOwnPost = currentUser?.userID === postUserId;

  // Normalize media URL - handle backend paths and convert to proper URL
  const getMediaUrl = (url: string | undefined) => {
    if (!url) return '';
    
    // If already an absolute URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Replace backslashes with forward slashes for Windows paths
    const normalizedPath = url.replace(/\\/g, '/');
    
    // If starts with forward slash, return as is
    if (normalizedPath.startsWith('/')) {
      return normalizedPath;
    }
    
    // Otherwise, prepend backend URL
    return `http://localhost:4005/${normalizedPath}`;
  };

  const mediaUrl = getMediaUrl(post.mediaUrl);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="post-card"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Link href={`/profile/${postUserId}`}>
                <Avatar className="w-11 h-11 ring-2 ring-transparent hover:ring-primary/20 transition-all">
                  {postUser.profilePicture ? (
                    <AvatarImage src={postUser.profilePicture} className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-gradient-bg-blue text-white font-semibold text-sm">
                      {getInitials(postUser.firstName, postUser.lastName)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={`/profile/${postUserId}`}>
                    <p className="font-semibold text-sm hover:text-primary transition-colors truncate">
                      {postUser.firstName} {postUser.lastName}
                    </p>
                  </Link>
                  {!isOwnPost && postUserId && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleFollow}
                      className={`follow-button ${isFollowing ? 'following' : 'not-following'}`}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5 mr-1 inline" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5 mr-1 inline" />
                          Follow
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-secondary">
                  <Link
                    href={`/community/${post.community?.id || 1}`}
                    className="hover:text-primary transition-colors font-medium"
                  >
                    {post.community?.name || 'Community'}
                  </Link>
                  <span>·</span>
                  <span>{formatRelativeTime(post.createdAt)}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 pt-0 px-4">
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{post.content}</p>
          {mediaUrl && (
            <div className="media-container">
              <Image
                src={mediaUrl}
                alt="Post media"
                width={1000}
                height={600}
                className="responsive-media"
                priority={false}
                unoptimized
              />
              <button
                onClick={() => setShowMediaModal(true)}
                className="media-expand-btn"
                aria-label="Expand media"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="post-actions px-4 pb-3 flex-col">
          <div className="flex items-center gap-1 w-full">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={likeMutation.isPending || unlikeMutation.isPending}
                className={`gap-2 transition-all duration-200 ${
                  liked 
                    ? 'text-red-500 hover:bg-red-50' 
                    : 'hover:bg-red-50 hover:text-red-500'
                }`}
              >
                <Heart
                  className={`h-5 w-5 transition-all ${
                    liked ? 'fill-red-500 text-red-500' : ''
                  } ${isAnimatingLike ? 'heart-animate' : ''}`}
                />
                <span className="text-xs font-semibold">{formatNumber(likeCount)}</span>
              </Button>
            </motion.div>

            <motion.div whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleComment}
                className="gap-2 hover:bg-blue-50 hover:text-blue-500"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-xs font-semibold">{formatNumber(commentCount)}</span>
              </Button>
            </motion.div>

            <motion.div whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleShare}
                className="gap-2 hover:bg-green-50 hover:text-green-500"
              >
                <Share2 className="h-5 w-5" />
                <span className="text-xs font-semibold">Share</span>
              </Button>
            </motion.div>
          </div>

          {/* Comment Input */}
          <CommentInput 
            postId={post.id} 
            isOpen={showCommentInput} 
            onClose={handleCommentClose}
          />
        </CardFooter>
      </motion.div>

      {/* Media Modal */}
      {mediaUrl && (
        <MediaModal
          isOpen={showMediaModal}
          onClose={() => setShowMediaModal(false)}
          mediaUrl={mediaUrl}
          alt={`Post by ${postUser.firstName} ${postUser.lastName}`}
        />
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postId={post.id}
        postContent={post.content}
      />
    </>
  );
}

