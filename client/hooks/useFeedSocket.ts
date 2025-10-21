import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';
import { useToastStore } from '@/store/useToastStore';
import type { CommunityPost } from '@/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4005';

export const useFeedSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  useEffect(() => {
    // Only create connection if not already connected
    if (socketRef.current?.connected) {
      console.log('🔗 Feed WebSocket already connected, skipping new connection');
      return;
    }

    if (!isAuthenticated) {
      console.log('🔒 User not authenticated, skipping Feed WebSocket connection');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('🔑 No access token found, skipping Feed WebSocket connection');
      return;
    }

    console.log('🔌 Attempting Feed WebSocket connection to:', `${SOCKET_URL}/feed`);

    // Connect to Feed Socket.io
    const bareToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    const socket = io(`${SOCKET_URL}/feed`, {
      auth: {
        token: bareToken,
      },
      extraHeaders: {
        token: bareToken,
        Authorization: `Bearer ${bareToken}`,
      },
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: true, // Force new connection
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Feed WebSocket connected successfully:', socket.id);
      console.log('🔗 Feed connection details:', {
        id: socket.id,
        transport: socket.io.engine.transport.name,
      });
    });

    // Listen for new posts
    socket.on('new_post', (postData: CommunityPost) => {
      console.log('📨 Received new post via WebSocket:', postData);
      
      // Invalidate and refetch posts queries to show the new post
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      // Show toast notification
      const userName = `${postData.user?.firstName || ''} ${postData.user?.lastName || ''}`.trim();
      const communityName = postData.community?.name || 'a community';
      addToast(`${userName} posted in ${communityName}`, 'info', 5000);
      
      // Optionally show browser notification
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('New Post', {
          body: `${userName} posted in ${communityName}`,
          icon: '/favicon.ico',
        });
      }
    });

    // Listen for post updates (likes, comments)
    // NOTE: We only update likeCount and commentCount from WebSocket, NOT isLiked
    // isLiked is user-specific and should only be updated by the user's own actions
    socket.on('post_updated', (updateData: { postId: number; likeCount?: number; commentCount?: number }) => {
      console.log('📝 Post updated via WebSocket:', updateData);
      console.log('📝 Socket connected:', socket.connected);
      console.log('📝 Socket ID:', socket.id);
      
      // Update specific post data in cache without full refetch
      queryClient.setQueryData(['posts'], (oldData: any) => {
        if (!oldData?.data) return oldData;
        
        return {
          ...oldData,
          data: oldData.data.map((post: CommunityPost) => {
            if (post.id === updateData.postId) {
              console.log('🔄 Updating post in cache:', post.id, 'with data:', updateData);
              return {
                ...post,
                likeCount: updateData.likeCount ?? post.likeCount,
                commentCount: updateData.commentCount ?? post.commentCount,
                // Keep isLiked as-is, it's user-specific
              };
            }
            return post;
          }),
        };
      });

      // Also update individual post queries if they exist
      queryClient.setQueryData(['post', updateData.postId], (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          likeCount: updateData.likeCount ?? oldData.likeCount,
          commentCount: updateData.commentCount ?? oldData.commentCount,
          // Keep isLiked as-is, it's user-specific
        };
      });
    });

    // Listen for post deletions
    socket.on('post_deleted', ({ postId }: { postId: number }) => {
      console.log('🗑️ Post deleted via WebSocket:', postId);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.removeQueries({ queryKey: ['post', postId] });
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Feed WebSocket disconnected:', reason);
      if (reason === 'io server disconnect') {
        console.log('🔄 Server initiated disconnect, attempting reconnection...');
      }
    });

    socket.on('connect_error', (error) => {
      console.error('🚨 Feed WebSocket connection error:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      
      if (error.message.includes('Authentication')) {
        console.log('🔐 Authentication failed, user may need to re-login');
      } else if (error.message.includes('ECONNREFUSED')) {
        console.log('🔌 Server connection refused - check if server is running on port 4005');
      } else if (error.message.includes('timeout')) {
        console.log('⏰ Connection timeout - server may be slow to respond');
      }
    });

    socket.on('error', (error) => {
      console.error('🚨 Feed WebSocket error:', error);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Feed WebSocket reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Feed WebSocket reconnection attempt:', attemptNumber);
    });

    socket.on('reconnect_error', (error) => {
      console.error('🚨 Feed WebSocket reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('🚨 Feed WebSocket reconnection failed after all attempts');
    });

    // Cleanup function - only disconnect if we're the ones who created the connection
    return () => {
      if (socketRef.current === socket && socket.connected) {
        console.log('🧹 Cleaning up Feed WebSocket connection');
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated]); // Remove queryClient from dependencies to prevent reconnections

  return socketRef.current;
};

