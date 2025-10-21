import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => analyticsService.getOverview(),
  });
};

export const useAnalyticsTrends = (period: 'daily' | 'weekly' | 'monthly' = 'daily') => {
  return useQuery({
    queryKey: ['analytics', 'trends', period],
    queryFn: () => analyticsService.getTrends(period),
  });
};

