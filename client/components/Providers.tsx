'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSocket } from '@/hooks/useSocket';
import { useFeedSocket } from '@/hooks/useFeedSocket';
import ToastContainer from '@/components/Toast/ToastContainer';

// Socket initializer component that runs inside QueryClientProvider
function SocketInitializer() {
  useSocket();
  useFeedSocket();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize authentication state
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // Apply theme to document
    console.log('🎨 Applying theme:', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    console.log('🎨 Document classes after toggle:', document.documentElement.className);
  }, [theme]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SocketInitializer />
      <ToastContainer />
      {children}
    </QueryClientProvider>
  );
}

