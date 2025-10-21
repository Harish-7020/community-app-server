'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Users, Plus, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PostCard } from '@/components/PostCard/PostCard';
import { useCommunity, useJoinCommunity, useLeaveCommunity } from '@/hooks/useCommunities';
import { useCommunityPosts } from '@/hooks/usePosts';
import { formatNumber } from '@/utils/formatter';
import { CreatePostModal } from '@/components/Modals/CreatePostModal';

export default function CommunityDetailPage() {
  const params = useParams();
  const communityId = Number(params.id);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const { data: community, isLoading: communityLoading } = useCommunity(communityId);
  const { data: posts, isLoading: postsLoading } = useCommunityPosts(communityId);
  const joinMutation = useJoinCommunity();
  const leaveMutation = useLeaveCommunity();

  const handleJoinToggle = () => {
    if (community?.isJoined) {
      leaveMutation.mutate(communityId);
    } else {
      joinMutation.mutate(communityId);
    }
  };

  if (communityLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (!community) {
    return <div>Community not found</div>;
  }

  return (
    <div className="reddit-layout">
      {/* Left Sidebar - Community Info */}
      <aside className="left-sidebar space-y-4 sticky top-20 h-fit">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                {community.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{community.name}</h3>
                <p className="text-xs text-muted-foreground">Community</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{formatNumber(community.memberCount || 0)}</span>
              <span className="text-muted-foreground text-xs">members</span>
            </div>
            <div className="space-y-2">
              <Button
                onClick={handleJoinToggle}
                variant={community.isJoined ? 'outline' : 'default'}
                disabled={joinMutation.isPending || leaveMutation.isPending}
                className="w-full"
                size="sm"
              >
                {community.isJoined ? 'Leave Community' : 'Join Community'}
              </Button>
              {community.isJoined && (
                <Button 
                  onClick={() => setShowCreatePost(true)}
                  className="w-full"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Post
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </aside>

      {/* Main Feed - Posts - Compact and Left-aligned */}
      <main className="min-h-screen space-y-4 -ml-2">
        <div className="max-w-4xl">
          {/* Community Header Card */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-2xl">{community.name}</CardTitle>
              <CardDescription className="mt-2">
                {community.description}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Posts Section */}
          {postsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse border-border">
                  <CardContent className="p-6">
                    <div className="flex gap-3 mb-4">
                      <div className="w-10 h-10 bg-muted rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-muted rounded w-1/4" />
                        <div className="h-3 bg-muted rounded w-1/6" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-5/6" />
                      <div className="h-3 bg-muted rounded w-4/6" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts && posts.data && posts.data.length > 0 ? (
            <div className="space-y-4">
              {posts.data.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <Card className="border-border">
              <CardContent className="py-12 text-center text-muted-foreground">
                <div className="w-16 h-16 rounded-lg bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                <p className="text-sm mb-4">
                  {community.isJoined ? 'Be the first to post in this community!' : 'Join the community to start posting.'}
                </p>
                {community.isJoined && (
                  <Button onClick={() => setShowCreatePost(true)} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Post
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Right Sidebar - Community Details */}
      <aside className="right-sidebar space-y-4 sticky top-20 h-fit">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <h3 className="font-semibold text-sm">About Community</h3>
          </CardHeader>
          <CardContent className="pt-0 space-y-3 text-sm text-muted-foreground">
            <p>{community.description || 'No description available.'}</p>
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs">Members</span>
                <span className="font-semibold text-foreground">{formatNumber(community.memberCount || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <h3 className="font-semibold text-sm">Community Rules</h3>
          </CardHeader>
          <CardContent className="pt-0 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="font-medium text-foreground">1.</span>
              <p>Be respectful and civil</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-foreground">2.</span>
              <p>Stay on topic</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-foreground">3.</span>
              <p>No spam or self-promotion</p>
            </div>
          </CardContent>
        </Card>
      </aside>

      {showCreatePost && (
        <CreatePostModal
          communityId={communityId}
          onClose={() => setShowCreatePost(false)}
        />
      )}
    </div>
  );
}

