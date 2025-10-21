import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';
import { LoginDto, SignupDto } from '@/types';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { setUser, logout: logoutStore } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  const signupMutation = useMutation({
    mutationFn: (data: SignupDto) => authService.signup(data),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logoutStore();
      queryClient.clear();
    },
  });

  const login = (data: LoginDto, options?: { onSuccess?: () => void }) => {
    console.log('useAuth: Starting login process');
    loginMutation.mutate(data, {
      onSuccess: (result) => {
        console.log('useAuth: Login mutation success, result:', result);
        setUser(result.user);
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        console.log('useAuth: User set, calling onSuccess callback');
        options?.onSuccess?.();
      },
      onError: (error) => {
        console.error('useAuth: Login mutation error:', error);
      }
    });
  };

  const signup = (data: SignupDto, options?: { onSuccess?: () => void }) => {
    signupMutation.mutate(data, {
      onSuccess: (result) => {
        setUser(result.user);
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        options?.onSuccess?.();
      },
    });
  };

  return {
    login,
    signup,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isSigningUp: signupMutation.isPending,
    loginError: loginMutation.error,
    signupError: signupMutation.error,
  };
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
    retry: false,
  });
};

