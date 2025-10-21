'use client';

import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/useAuthStore';
import { userService } from '@/services/user.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Camera, X } from 'lucide-react';
import { z } from 'zod';
import { getInitials } from '@/utils/formatter';
// Notification dependency removed for portability

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  aboutMe: z.string().max(500, 'About me must be less than 500 characters').optional(),
});

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      aboutMe: user?.aboutMe || '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: { firstName: string; lastName: string; aboutMe?: string }) => userService.updateProfile(user?.userID || 0, data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      updateUser(updatedUser);
      console.log('Profile updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
    },
  });

  const uploadProfilePictureMutation = useMutation({
    mutationFn: (file: File) => userService.uploadProfilePicture(file, user?.userID || 0),
    onSuccess: (result) => {
      // Update the user's profile picture
      updateUser({ ...user, profilePicture: result.url });
      setProfilePicture(null);
      setPreviewUrl(null);
      console.log('Profile picture uploaded successfully');
    },
    onError: (error) => {
      console.error('Failed to upload profile picture:', error);
      setIsUploading(false);
    },
  });

  const onSubmit = async (data: { firstName: string; lastName: string; aboutMe?: string }) => {
    setIsUpdating(true);
    try {
      await updateProfileMutation.mutateAsync(data);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setProfilePicture(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!profilePicture) return;
    
    setIsUploading(true);
    try {
      await uploadProfilePictureMutation.mutateAsync(profilePicture);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePreview = () => {
    setProfilePicture(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="linkedin-bg min-h-screen">
      <div className="linkedin-container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Page Header */}
          <div className="mb-2">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Profile Information Card - LinkedIn Style */}
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-xl">Profile Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            
            {/* Profile Picture Upload Section */}
            <CardContent className="pt-6 pb-0">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-20 h-20 ring-4 ring-border">
                    {previewUrl ? (
                      <AvatarImage src={previewUrl} alt="Preview" />
                    ) : user?.profilePicture ? (
                      <AvatarImage src={user.profilePicture} alt={user.firstName} />
                    ) : (
                      <AvatarFallback className="bg-gradient-bg-blue text-white font-bold text-2xl">
                        {getInitials(user?.firstName, user?.lastName)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {previewUrl && (
                    <button
                      onClick={handleRemovePreview}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Profile Picture</h3>
                  <div className="flex gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Choose Photo
                    </Button>
                    {profilePicture && (
                      <Button
                        type="button"
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="gap-2"
                      >
                        {isUploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Upload
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                </div>
              </div>
            </CardContent>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-semibold">First Name</Label>
                    <Input 
                      id="firstName" 
                      {...register('firstName')} 
                      className="h-11"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-semibold">Last Name</Label>
                    <Input 
                      id="lastName" 
                      {...register('lastName')} 
                      className="h-11"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aboutMe" className="text-sm font-semibold">About Me</Label>
                  <Textarea
                    id="aboutMe"
                    rows={5}
                    {...register('aboutMe')}
                    className="resize-none"
                    placeholder="Tell us about yourself..."
                  />
                  {errors.aboutMe && (
                    <p className="text-sm text-destructive">{errors.aboutMe.message}</p>
                  )}
                </div>
                <div className="flex justify-end pt-4 border-t border-border">
                  <Button 
                    type="submit" 
                    disabled={isUpdating} 
                    className="px-8"
                    size="lg"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>

          {/* Account Settings Card */}
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-xl">Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user?.email || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="font-medium">Account Created</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

