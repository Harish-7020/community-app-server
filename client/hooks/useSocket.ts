import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useToastStore } from '@/store/useToastStore';
import type { Notification as NotificationType } from '@/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4005';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    // Only create connection if not already connected
    if (socketRef.current?.connected) {
      console.log('🔗 WebSocket already connected, skipping new connection');
      return;
    }

    if (!isAuthenticated) {
      console.log('🔒 User not authenticated, skipping WebSocket connection');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('🔑 No access token found, skipping WebSocket connection');
      return;
    }

    console.log('🔌 Attempting WebSocket connection to:', `${SOCKET_URL}/notifications`);

    // Connect to Socket.io with authentication
    const bareToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    const socket = io(`${SOCKET_URL}/notifications`, {
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
      console.log('✅ WebSocket connected successfully:', socket.id);
      console.log('🔗 Connection details:', {
        id: socket.id,
        transport: socket.io.engine.transport.name,
      });
    });

    socket.on('notification', (data: NotificationType) => {
      console.log('📨 Received real-time notification:', data);
      addNotification(data);
      
      // Show toast notification
      addToast(data.content || 'You have a new notification', 'info', 5000);
      
      // Show browser notification if permission granted
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('New Notification', {
          body: data.content || 'You have a new notification',
          icon: '/favicon.ico',
        });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      if (reason === 'io server disconnect') {
        console.log('🔄 Server initiated disconnect, attempting reconnection...');
      }
    });

    socket.on('connect_error', (error) => {
      console.error('🚨 WebSocket connection error:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      
      // Don't crash the app if socket connection fails
      if (error.message.includes('Authentication')) {
        console.log('🔐 Authentication failed, user may need to re-login');
      } else if (error.message.includes('ECONNREFUSED')) {
        console.log('🔌 Server connection refused - check if server is running on port 4005');
      } else if (error.message.includes('timeout')) {
        console.log('⏰ Connection timeout - server may be slow to respond');
      }
    });

    socket.on('error', (error) => {
      console.error('🚨 WebSocket error:', error);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 WebSocket reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 WebSocket reconnection attempt:', attemptNumber);
    });

    socket.on('reconnect_error', (error) => {
      console.error('🚨 WebSocket reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('🚨 WebSocket reconnection failed after all attempts');
    });

    // Cleanup function - only disconnect if we're the ones who created the connection
    return () => {
      if (socketRef.current === socket && socket.connected) {
        console.log('🧹 Cleaning up WebSocket connection');
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated]); // Remove addNotification from dependencies to prevent reconnections

  return socketRef.current;
};

