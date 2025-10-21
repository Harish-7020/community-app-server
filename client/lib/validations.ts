import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(25),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(25),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const communitySchema = z.object({
  name: z.string().min(3, 'Community name must be at least 3 characters').max(100),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

export const postSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(5000),
  communityId: z.number().positive('Please select a community'),
});

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
});

export const profileSchema = z.object({
  firstName: z.string().min(2).max(25).optional(),
  lastName: z.string().min(2).max(25).optional(),
  aboutMe: z.string().max(500).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CommunityInput = z.infer<typeof communitySchema>;
export type PostInput = z.infer<typeof postSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;

