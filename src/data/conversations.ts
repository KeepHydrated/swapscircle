
export type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar?: string;
  rating?: number;
  isNew?: boolean;
  distance?: string;
};

export const mockConversations: Conversation[] = [
  {
    id: "1",
    name: "Emma Wilson",
    lastMessage: "Be the first to reach out and start the conversation.",
    time: "New match",
    rating: 5,
    distance: "2.3 mi away",
    isNew: true
  },
  {
    id: "2",
    name: "Sarah Johnson",
    lastMessage: "Would you like to meet up sometime this week?",
    time: "Today, 10:30 AM"
  },
  {
    id: "3",
    name: "Michael Thompson",
    lastMessage: "I can drop it off this weekend if that works for you.",
    time: "Today, 9:15 AM"
  },
  {
    id: "4",
    name: "Jessica Lee",
    lastMessage: "Great, I'll take it! When can we meet?",
    time: "Yesterday, 5:45 PM"
  },
  {
    id: "5",
    name: "David Rodriguez",
    lastMessage: "Would you consider trading for my blender?",
    time: "Mon, 3:20 PM"
  }
];
