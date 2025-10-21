'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreatePost } from '@/hooks/usePosts';
import { postSchema } from '@/lib/validations';
import { z } from 'zod';

interface CreatePostModalProps {
  communityId: number;
  onClose: () => void;
}

const postFormSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(5000),
});

type PostFormInput = z.infer<typeof postFormSchema>;

export function CreatePostModal({ communityId, onClose }: CreatePostModalProps) {
  const createMutation = useCreatePost();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostFormInput>({
    resolver: zodResolver(postFormSchema),
  });

  const onSubmit = (data: PostFormInput) => {
    createMutation.mutate(
      { ...data, communityId },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <Card className="w-full max-w-2xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Create Post</CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="What's on your mind?"
                  rows={6}
                  {...register('content')}
                />
                {errors.content && (
                  <p className="text-sm text-destructive">{errors.content.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Posting...' : 'Post'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

