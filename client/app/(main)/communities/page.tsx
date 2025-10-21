'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Sparkles, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CommunityCard } from '@/components/CommunityCard/CommunityCard';
import { useCommunities } from '@/hooks/useCommunities';
import { CreateCommunityModal } from '@/components/Modals/CreateCommunityModal';

export default function CommunitiesPage() {
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('popular');
  const { data, isLoading } = useCommunities(page, 12);

  const filteredCommunities = data?.data.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="reddit-layout">
      {/* Left Sidebar - Filters */}
      <aside className="left-sidebar space-y-4 sticky top-20 h-fit">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <h3 className="font-semibold text-sm">Sort By</h3>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              <button
                onClick={() => setSortBy('popular')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortBy === 'popular'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <Users className="w-4 h-4" />
                Popular
              </button>
              <button
                onClick={() => setSortBy('recent')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortBy === 'recent'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Recent
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <Button 
              onClick={() => setShowCreateModal(true)} 
              className="w-full"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Community
            </Button>
          </CardContent>
        </Card>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen space-y-6">
        {/* Page Header */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <Badge variant="secondary" className="rounded-full">
                {data?.totalCount || 0} Communities
              </Badge>
            </div>
            <h1 className="text-3xl font-bold mb-2">Discover Communities</h1>
            <p className="text-muted-foreground">
              Join vibrant communities, share your passions, and connect with like-minded people.
            </p>
          </CardHeader>
        </Card>

        {/* Search Bar */}
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Communities Grid */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="h-48 rounded-lg bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : filteredCommunities.length > 0 ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <AnimatePresence>
                  {filteredCommunities.map((community, index) => (
                    <motion.div
                      key={community.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <CommunityCard community={community} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <Card className="border-border">
                  <CardContent className="p-4">
                    <div className="flex justify-center items-center gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        size="sm"
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
                        <span className="text-sm font-medium">
                          Page {page} of {data.totalPages}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                        disabled={page === data.totalPages}
                        size="sm"
                      >
                        Next
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 rounded-lg bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">No communities found</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  {searchQuery 
                    ? `No communities match "${searchQuery}". Try a different search term.`
                    : "No communities are available right now. Be the first to create one!"
                  }
                </p>
                {!searchQuery && (
                  <Button 
                    onClick={() => setShowCreateModal(true)} 
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Community
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Right Sidebar - Stats & Info */}
      <aside className="right-sidebar space-y-4 sticky top-20 h-fit">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <h3 className="font-semibold text-sm">About Communities</h3>
          </CardHeader>
          <CardContent className="pt-0 space-y-3 text-xs text-muted-foreground">
            <p>
              Browse and join communities that match your interests. Connect with people who share your passions.
            </p>
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Total Communities</span>
                <Badge variant="secondary">{data?.totalCount || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <h3 className="font-semibold text-sm">Quick Tips</h3>
          </CardHeader>
          <CardContent className="pt-0 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
              <p>Click on a community to view posts and join discussions</p>
            </div>
            <div className="flex items-start gap-2">
              <Plus className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
              <p>Create your own community to build a space for your interests</p>
            </div>
          </CardContent>
        </Card>
      </aside>

      {showCreateModal && (
        <CreateCommunityModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

