import { api } from '@/lib/api';
import { AnalyticsData } from '@/types';

export const analyticsService = {
  getOverview: async (): Promise<AnalyticsData> => {
    const response = await api.get('/analytics/overview');
    // Backend wraps response in { success, data, statusCode }
    return response.data.data || response.data;
  },

  getTrends: async (period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<any> => {
    const response = await api.get('/analytics/trends', { params: { period } });
    // Backend wraps response in { success, data, statusCode }
    return response.data.data || response.data;
  },
};

