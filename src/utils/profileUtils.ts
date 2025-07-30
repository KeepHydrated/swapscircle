import { User } from '@/services/authService';

export const isProfileComplete = (user: User | null): boolean => {
  if (!user) return false;
  
  // Profile is complete if user has both username and avatar
  // Location and bio are optional
  return !!(user.name && user.avatar_url);
};

export const isNewUser = (user: User | null): boolean => {
  if (!user) return false;
  
  // Consider a user "new" if they don't have username or avatar set up
  // These are required to post on the website
  return !user.name || !user.avatar_url;
};