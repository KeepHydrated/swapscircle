import { User } from '@/services/authService';

export const isProfileComplete = (user: User | null): boolean => {
  if (!user) return false;
  
  // Profile is complete if user has a username (avatar is optional - initials avatar is fine)
  return !!(user.name);
};

export const isNewUser = (user: User | null): boolean => {
  if (!user) return false;
  
  // Consider a user "new" if they don't have username or avatar set up
  // These are required to post on the website
  return !user.name || !user.avatar_url;
};