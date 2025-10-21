'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Calendar, User, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { formatDate } from '@/utils/date';
import { getInitials } from '@/utils/formatter';

export default function ProfilePage() {
  const params = useParams();
  const userId = Number(params.userId);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getById(userId),
  });

  if (isLoading) {
    return (
      <div className="linkedin-bg min-h-screen">
        <div className="linkedin-container">
          <div className="space-y-4 animate-pulse">
            <Card className="border-border shadow-sm">
              <CardContent className="p-6">
                <div className="h-32 bg-muted rounded-lg mb-4"></div>
                <div className="h-24 bg-muted rounded-lg"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="linkedin-bg min-h-screen">
        <div className="linkedin-container">
          <Card className="border-border shadow-sm">
            <CardContent className="py-12 text-center">
              <div className="text-muted-foreground">
                <User className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">User not found</h3>
                <p>The user you&apos;re looking for doesn&apos;t exist.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="linkedin-bg min-h-screen">
      <div className="linkedin-container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Profile Header Card - LinkedIn Style */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-0">
              {/* Cover area */}
              <div className="h-32 bg-gradient-to-r from-primary/20 to-accent/20 rounded-t-lg" />
              
              {/* Profile info */}
              <div className="px-6 pb-6">
                <div className="flex flex-col items-center -mt-16 mb-4">
                  <Avatar className="h-32 w-32 border-4 border-card shadow-lg">
                    {user.profilePicture ? (
                      <AvatarImage 
                        src={user.profilePicture} 
                        alt={`${user.firstName} ${user.lastName}`}
                      />
                    ) : (
                      <AvatarFallback className="text-4xl bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                
                <div className="text-center mb-4">
                  <h1 className="text-3xl font-bold mb-2">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-muted-foreground">
                    Member since {user.createdAt ? formatDate(user.createdAt) : 'Unknown'}
                  </p>
                </div>

                {/* Quick Info */}
                <div className="flex justify-center gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{user.email || 'Not provided'}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Joined {user.createdAt ? formatDate(user.createdAt) : 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About Section - LinkedIn Style */}
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {user.aboutMe ? (
                <p className="text-base leading-relaxed text-muted-foreground">{user.aboutMe}</p>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium mb-1">No bio available</p>
                  <p className="text-sm">This user hasn&apos;t added a bio yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Information - LinkedIn Style */}
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">First Name</label>
                  <p className="text-base font-medium">{user.firstName || 'Not provided'}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Last Name</label>
                  <p className="text-base font-medium">{user.lastName || 'Not provided'}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base font-medium">{user.email || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Member Since</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base font-medium">{user.createdAt ? formatDate(user.createdAt) : 'Unknown'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

