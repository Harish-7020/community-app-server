'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  TrendingUp, 
  Plus, 
  Users, 
  Compass, 
  Clock,
  Sparkles,
  Flame
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PostCard } from '@/components/PostCard/PostCard';
import { usePosts } from '@/hooks/usePosts';
import { useCommunities } from '@/hooks/useCommunities';
import { useAuthStore } from '@/store/useAuthStore';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'home' | 'popular' | 'latest'>('home');
  const { data: posts, isLoading: postsLoading, error: postsError } = usePosts(1, 20);
  const { data: communities, isLoading: communitiesLoading } = useCommunities(1, 10);
  const { user } = useAuthStore();

  // Check if posts exist and show appropriate message
  const hasPosts = posts && posts.data && posts.data.length > 0;
  const isEmpty = posts && posts.data && posts.data.length === 0;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background">
      {/* Left Sidebar - Quick Navigation */}
      <aside className="w-full lg:w-64 p-4 lg:p-6 space-y-4 lg:space-y-6 lg:sticky lg:top-0 lg:h-fit order-2 lg:order-1">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-sm">Feed</h3>
            </div>
          </CardHeader>
          <CardContent className="p-3 space-y-1">
            <motion.button
              onClick={() => setActiveTab('home')}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'home'
                  ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-500 shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <Home className="w-5 h-5" />
              Home
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('popular')}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'popular'
                  ? 'bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-500 shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <Flame className="w-5 h-5" />
              Popular
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('latest')}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'latest'
                  ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-500 shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <Clock className="w-5 h-5" />
              Latest
            </motion.button>
            <div className="border-t border-border my-2" />
            <Link href="/communities">
              <motion.button 
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 hover:text-purple-500 transition-all"
              >
                <Users className="w-5 h-5" />
                Communities
              </motion.button>
            </Link>
          </CardContent>
        </Card>
      </aside>

      {/* Main Feed - Compact and Left-aligned */}
      <main className="flex-1 p-4 lg:p-6 order-1 lg:order-2">
        <div className="max-w-4xl mx-auto space-y-6">
          {postsLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="animate-pulse post-card">
                    <CardContent className="p-5">
                      <div className="flex gap-3 mb-4">
                        <div className="w-11 h-11 bg-gradient-bg-blue/20 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded-lg w-1/3" />
                          <div className="h-3 bg-muted rounded-lg w-1/4" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded-lg w-full" />
                        <div className="h-3 bg-muted rounded-lg w-5/6" />
                        <div className="h-3 bg-muted rounded-lg w-4/6" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : postsError ? (
            <Card className="post-card">
              <CardContent className="p-16 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/20 flex items-center justify-center mx-auto mb-6">
                    <Compass className="w-10 h-10 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Unable to load posts</h3>
                  <p className="text-sm text-secondary mb-6 max-w-md mx-auto">
                    Please check your connection and try again.
                  </p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    size="lg"
                    className="rounded-xl shadow-lg"
                  >
                    Try Again
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          ) : hasPosts ? (
            <div className="space-y-0">
              {posts.data.map((post, index) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : isEmpty ? (
            <Card className="post-card">
              <CardContent className="p-16 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-bg-purple flex items-center justify-center mx-auto mb-6">
                    <Compass className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Your feed is empty</h3>
                  <p className="text-sm text-secondary mb-6 max-w-md mx-auto">
                    Join communities to see posts in your personalized feed. Connect with like-minded people and start exploring!
                  </p>
                  <Link href="/communities">
                    <Button size="lg" className="rounded-xl shadow-lg">
                      <Users className="w-5 h-5 mr-2" />
                      Explore Communities
                    </Button>
                  </Link>
                </motion.div>
              </CardContent>
            </Card>
          ) : (
            <Card className="post-card">
              <CardContent className="p-16 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                    <Compass className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">No posts available</h3>
                  <p className="text-sm text-secondary mb-6 max-w-md mx-auto">
                    There are no posts to display right now.
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Right Sidebar - Trending Communities & Quick Actions */}
      <aside className="w-full lg:w-80 p-4 lg:p-6 space-y-4 lg:space-y-6 lg:sticky lg:top-0 lg:h-fit order-3">
        {/* Trending Communities */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm">Trending</h3>
              </div>
              <Link href="/communities">
                <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold hover:bg-orange-50 hover:text-orange-500">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-3">
            {communitiesLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    className="flex items-center gap-3 p-2 animate-pulse"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="w-10 h-10 bg-gradient-bg-blue/20 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-muted rounded-lg w-3/4" />
                      <div className="h-2 bg-muted rounded-lg w-1/2" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : communities && communities.data && communities.data.length > 0 ? (
              <div className="space-y-1">
                {communities.data.slice(0, 5).map((community, index) => (
                  <Link key={community.id} href={`/community/${community.id}`}>
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30 transition-all cursor-pointer group"
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-bg-blue flex items-center justify-center font-bold text-sm text-white shadow-md group-hover:shadow-lg transition-shadow">
                        {community.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                          {community.name}
                        </p>
                        <p className="text-xs text-secondary">
                          {community.memberCount || 0} members
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8" />
                </div>
                <p className="text-xs font-medium">No communities yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-sm">Quick Actions</h3>
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-3 space-y-2">
            <Link href="/communities">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" className="w-full justify-start text-sm font-semibold rounded-xl border-2 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 hover:border-purple-500 hover:text-purple-500" size="sm">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Community
                </Button>
              </motion.div>
            </Link>
            <Link href="/search">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" className="w-full justify-start text-sm font-semibold rounded-xl border-2 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-cyan-500/10 hover:border-blue-500 hover:text-blue-500" size="sm">
                  <Compass className="w-5 h-5 mr-2" />
                  Explore
                </Button>
              </motion.div>
            </Link>
          </CardContent>
        </Card>

        {/* User Info Card */}
        {user && (
          <Card className="border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-3">
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </div>
                <h4 className="font-bold text-sm mb-1">{user.firstName} {user.lastName}</h4>
                <p className="text-xs text-secondary mb-3">{user.email}</p>
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  <Sparkles className="w-3 h-3 mr-1 inline" />
                  Active Member
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </aside>
    </div>
  );
}