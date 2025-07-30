import { User } from '@/services/authService';

export const isProfileComplete = (user: User | null): boolean => {
  if (!user) return false;
  
  // Consider profile complete if user has name/username and avatar
  return !!(user.name && user.avatar_url);
};

export const isNewUser = (user: User | null): boolean => {
  if (!user) return false;
  
  // Consider a user "new" if they don't have a name or avatar set up
  return !user.name || !user.avatar_url;
};