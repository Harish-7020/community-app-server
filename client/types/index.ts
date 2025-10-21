// User Types
export interface User {
  userID: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  aboutMe?: string;
  profilePicture?: string;
  createdAt?: Date;
  modifiedAt?: Date;
}

// Community Types
export interface Community {
  id: number;
  name: string;
  description?: string;
  createdBy?: User;
  createdAt: Date;
  updatedAt: Date;
  memberCount?: number;
  isJoined?: boolean;
}

// Post Types
export interface CommunityPost {
  id: number;
  content: string;
  mediaUrl?: string;
  user: User;
  community: Community;
  likes: PostLike[];
  comments: PostComment[];
  createdAt: Date;
  updatedAt: Date;
  likeCount?: number;
  commentCount?: number;
  isLiked?: boolean;
  // Additional fields from backend response
  firstName?: string;
  lastName?: string;
  email?: string;
  likesCount?: number;
}

export interface PostLike {
  id: number;
  user: User;
  post: CommunityPost;
  createdAt: Date;
}

export interface PostComment {
  id: number;
  content: string;
  user: User;
  post: CommunityPost;
  createdAt: Date;
  updatedAt: Date;
}

// Notification Types
export enum NotificationType {
  POST_CREATED = 'POST_CREATED',
  POST_LIKED = 'POST_LIKED',
  POST_COMMENTED = 'POST_COMMENTED',
  NEW_MEMBER = 'NEW_MEMBER',
  DIRECT_MESSAGE = 'DIRECT_MESSAGE',
}

export interface Notification {
  id: number;
  type: NotificationType;
  content?: string;
  referenceId?: number;
  referenceType?: string;
  user: User;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Types
export interface AnalyticsData {
  totalUsers: number;
  newUsers: number;
  totalCommunities: number;
  activeCommunities: number;
  totalPosts: number;
  popularPosts: CommunityPost[];
  topEngagedUsers: User[];
  trends: {
    date: string;
    posts: number;
    users: number;
  }[];
}

// Search Types
export enum SearchType {
  ALL = 'all',
  USER = 'user',
  COMMUNITY = 'community',
  POST = 'post',
}

export interface SearchResult {
  type: 'user' | 'community' | 'post';
  id: number;
  name?: string;
  title?: string;
  content?: string;
  avatar?: string;
  createdAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth Types
export interface LoginDto {
  username: string;
  password: string;
}

export interface SignupDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

