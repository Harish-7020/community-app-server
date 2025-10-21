'use client';

import { motion } from 'framer-motion';
import { Users, TrendingUp, MessageSquare, Globe } from 'lucide-react';
import { MetricCard } from '@/components/AnalyticsWidgets/MetricCard';
import { TrendsChart } from '@/components/AnalyticsWidgets/TrendsChart';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useAnalytics();

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">
          Detailed insights into your community platform
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : analytics ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Users"
              value={analytics.totalUsers}
              icon={Users}
            />
            <MetricCard
              title="New Users"
              value={analytics.newUsers}
              icon={Users}
            />
            <MetricCard
              title="Total Communities"
              value={analytics.totalCommunities}
              icon={Globe}
            />
            <MetricCard
              title="Total Posts"
              value={analytics.totalPosts}
              icon={MessageSquare}
            />
          </div>

          <div className="glass rounded-3xl p-4 md:p-6">
            <TrendsChart data={{
              dailyPosts: (analytics.trends && Array.isArray(analytics.trends)) ? analytics.trends.map(trend => ({
                date: trend.date,
                postsCount: trend.posts.toString()
              })) : [],
              dailyUsers: (analytics.trends && Array.isArray(analytics.trends)) ? analytics.trends.map(trend => ({
                date: trend.date,
                usersCount: trend.users.toString()
              })) : []
            }} />
          </div>
        </>
      ) : null}
    </div>
  );
}

