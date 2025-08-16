
import { mockUserItems } from '@/data/mockUsers';
import { Friend } from '@/types/profile';

export const myFriends: Friend[] = [
  {
    id: "friend1",
    name: "Jessica L.",
    friendCount: 24,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    items: mockUserItems["friend1"] || []
  },
  {
    id: "friend2",
    name: "Marcus T.",
    friendCount: 18,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    items: mockUserItems["friend2"] || []
  },
  {
    id: "friend3",
    name: "Sophia R.",
    friendCount: 32,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    items: mockUserItems["friend3"] || []
  }
];
