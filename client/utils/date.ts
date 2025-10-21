import { formatDistanceToNow, format } from 'date-fns';

export const formatRelativeTime = (date: Date | string): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatDate = (date: Date | string): string => {
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatDateTime = (date: Date | string): string => {
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

