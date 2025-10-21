import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => {
        console.log('Setting user:', user);
        set({ user, isAuthenticated: !!user, isLoading: false });
      },
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          set({ user: updatedUser });
        }
      },
      logout: () => {
        localStorage.removeItem('accessToken');
        set({ user: null, isAuthenticated: false });
      },
      initializeAuth: () => {
        const token = localStorage.getItem('accessToken');
        const storedUser = get().user;
        console.log('Initializing auth - Token:', !!token, 'User:', !!storedUser);
        
        if (token) {
          // Token exists - set authenticated to true
          set({ isAuthenticated: true, isLoading: false });
          console.log('Auth initialized: Authenticated with token');
        } else {
          set({ isAuthenticated: false, isLoading: false });
          console.log('Auth initialized: Not authenticated');
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

