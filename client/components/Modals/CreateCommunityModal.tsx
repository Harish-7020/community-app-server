'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateCommunity } from '@/hooks/useCommunities';
import { communitySchema, CommunityInput } from '@/lib/validations';

interface CreateCommunityModalProps {
  onClose: () => void;
}

export function CreateCommunityModal({ onClose }: CreateCommunityModalProps) {
  const createMutation = useCreateCommunity();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CommunityInput>({
    resolver: zodResolver(communitySchema),
  });

  const onSubmit = (data: CommunityInput) => {
    console.log('Submitting community data:', data);
    createMutation.mutate(data, {
      onSuccess: () => {
        console.log('Community created successfully');
        onClose();
      },
      onError: (error: unknown) => {
        console.error('Failed to create community:', error);
        const errorResponse = (error as { response?: { data?: unknown } })?.response?.data;
        console.error('Error response:', errorResponse);
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Card className="w-full max-w-md shadow-2xl animate-scale-in">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Create New Community</CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Community Name</Label>
                <Input
                  id="name"
                  placeholder="Enter community name"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your community..."
                  rows={4}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-2">
              {createMutation.error && (
                <p className="text-sm text-destructive w-full text-center">
                  {(createMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message || 
                   (createMutation.error as { message?: string })?.message || 
                   'Failed to create community. Please try again.'}
                </p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Community'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
}

