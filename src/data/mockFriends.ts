
import { mockUserItems } from '@/data/mockUsers';

// Mock friends data for users

export interface Friend {
  id: string;
  name: string;
  friendCount: number;
  avatar: string;
  items: any[];
}

const mockUserFriends: Record<string, Friend[]> = {
  "user1": [
    {
      id: "friend1",
      name: "Michael R.",
      friendCount: 15,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      items: mockUserItems["friend1"] || []
    },
    {
      id: "friend2",
      name: "Sophia T.",
      friendCount: 27,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      items: mockUserItems["friend2"] || []
    }
  ],
  "user2": [
    {
      id: "friend3",
      name: "Alex P.",
      friendCount: 12,
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61",
      items: mockUserItems["friend3"] || []
    },
    {
      id: "friend4",
      name: "Emma L.",
      friendCount: 19,
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956",
      items: mockUserItems["friend3"] || []
    }
  ]
};

export const getUserFriends = (userId: string): Friend[] => {
  return mockUserFriends[userId as keyof typeof mockUserFriends] || [];
};

export type { Friend };
