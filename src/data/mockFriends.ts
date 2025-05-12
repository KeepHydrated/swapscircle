
// Mock friends data for users

interface Friend {
  id: string;
  name: string;
  mutualItems: number;
  avatar: string;
}

const mockUserFriends: Record<string, Friend[]> = {
  "user1": [
    {
      id: "friend1",
      name: "Michael R.",
      mutualItems: 4,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
    },
    {
      id: "friend2",
      name: "Sophia T.",
      mutualItems: 2,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
    }
  ],
  "user2": [
    {
      id: "friend3",
      name: "Alex P.",
      mutualItems: 5,
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61"
    },
    {
      id: "friend4",
      name: "Emma L.",
      mutualItems: 3,
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956"
    }
  ]
};

export const getUserFriends = (userId: string): Friend[] => {
  return mockUserFriends[userId as keyof typeof mockUserFriends] || [];
};

export type { Friend };
