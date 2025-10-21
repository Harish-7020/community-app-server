import { api } from '@/lib/api';
import { LoginDto, SignupDto, AuthResponse } from '@/types';

export const authService = {
  login: async (data: LoginDto): Promise<AuthResponse> => {
    console.log('Auth service: Attempting login with data:', data);
    const response = await api.post('/auth/login', data);
    console.log('Auth service: Login response:', response.data);
    
    // Backend wraps response in { success, data, statusCode }
    const authData = response.data.data;
    
    if (authData.accessToken) {
      localStorage.setItem('accessToken', authData.accessToken);
      console.log('Auth service: Token stored in localStorage');
    }
    return authData;
  },

  signup: async (data: SignupDto): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    // Backend wraps response in { success, data, statusCode }
    const authData = response.data.data;
    if (authData.accessToken) {
      localStorage.setItem('accessToken', authData.accessToken);
    }
    return authData;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('accessToken');
    await api.post('/auth/logout');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    // Backend wraps response in { success, data, statusCode }
    return response.data.data;
  },
};

