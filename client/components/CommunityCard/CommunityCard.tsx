'use client';

import { motion } from 'framer-motion';
import { Users, Calendar, Sparkles, Crown, Settings } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Community } from '@/types';
import { useJoinCommunity, useLeaveCommunity } from '@/hooks/useCommunities';
import { useAuthStore } from '@/store/useAuthStore';
import { formatNumber } from '@/utils/formatter';

interface CommunityCardProps {
  community: Community;
}

export function CommunityCard({ community }: CommunityCardProps) {
  const joinMutation = useJoinCommunity();
  const leaveMutation = useLeaveCommunity();
  const { user } = useAuthStore();

  // Check if current user is the creator/owner of the community
  const isOwner = community.createdBy?.userID === user?.userID || 
                  community.createdBy === user?.userID;

  const handleJoinToggle = () => {
    if (community.isJoined) {
      leaveMutation.mutate(community.id);
    } else {
      joinMutation.mutate(community.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, scale: 1.03 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-full"
    >
      <Card className="h-full group cursor-pointer hover:shadow-2xl transition-all duration-300 rounded-3xl border-0 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              {community.name.charAt(0).toUpperCase()}
            </div>
            <Badge variant={isOwner ? "default" : community.isJoined ? "secondary" : "outline"} className="rounded-full text-xs">
              {isOwner ? (
                <div className="flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  <span>Owner</span>
                </div>
              ) : community.isJoined ? 'Joined' : 'Open'}
            </Badge>
          </div>
          <Link href={`/community/${community.id}`}>
            <CardTitle className="text-lg group-hover:text-primary transition-colors duration-200 mb-2">
              {community.name}
            </CardTitle>
          </Link>
          <CardDescription className="line-clamp-3 text-sm leading-relaxed">
            {community.description || 'Join this community to connect with like-minded people and share your interests.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="font-medium">{formatNumber(community.memberCount || 0)}</span>
              <span>members</span>
            </div>
            {community.createdAt && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(community.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="pt-0">
          {isOwner ? (
            <Link href={`/community/${community.id}/settings`}>
              <Button
                variant="default"
                className="w-full rounded-2xl h-12 font-semibold transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>Manage Community</span>
                </div>
              </Button>
            </Link>
          ) : (
            <Button
              onClick={handleJoinToggle}
              variant={community.isJoined ? 'outline' : 'default'}
              className="w-full rounded-2xl h-12 font-semibold transition-all duration-200"
              disabled={joinMutation.isPending || leaveMutation.isPending}
            >
              {joinMutation.isPending || leaveMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : community.isJoined ? (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Leave Community</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Join Community</span>
                </div>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

