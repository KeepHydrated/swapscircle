
export type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar?: string;
  rating: number;
  isNew?: boolean;
  distance: string;
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
    time: "Today, 10:30 AM",
    rating: 4,
    distance: "1.7 mi away"
  },
  {
    id: "3",
    name: "Michael Thompson",
    lastMessage: "I can drop it off this weekend if that works for you.",
    time: "Today, 9:15 AM",
    rating: 5,
    distance: "3.2 mi away"
  },
  {
    id: "4",
    name: "Jessica Lee",
    lastMessage: "Great, I'll take it! When can we meet?",
    time: "Yesterday, 5:45 PM",
    rating: 3,
    distance: "0.8 mi away"
  },
  {
    id: "5",
    name: "David Rodriguez",
    lastMessage: "Would you consider trading for my blender?",
    time: "Mon, 3:20 PM",
    rating: 4,
    distance: "4.5 mi away"
  },
  {
    id: "6",
    name: "Alex Chen",
    lastMessage: "I've had this item for about 6 months but it's barely used.",
    time: "Sun, 1:15 PM",
    rating: 5,
    distance: "1.3 mi away"
  },
  {
    id: "7",
    name: "Taylor Wright",
    lastMessage: "Perfect! The coffee shop on Main St. at 3pm tomorrow works for me.",
    time: "Sat, 4:22 PM",
    rating: 4,
    distance: "2.8 mi away"
  },
  {
    id: "8",
    name: "Jordan Parker",
    lastMessage: "Do you have any photos showing the condition of the item?",
    time: "Fri, 11:05 AM",
    rating: 4,
    distance: "3.5 mi away"
  },
  {
    id: "9",
    name: "Casey Morgan",
    lastMessage: "I can offer you my guitar amplifier plus $20. Would that work?",
    time: "Thu, 7:30 PM",
    rating: 3,
    distance: "5.1 mi away"
  },
  {
    id: "10",
    name: "Riley Johnson",
    lastMessage: "Thanks for the smooth exchange! Would love to trade again sometime.",
    time: "Wed, 2:45 PM",
    rating: 5,
    distance: "2.0 mi away"
  },
  {
    id: "11",
    name: "Jamie Edwards",
    lastMessage: "I'm going to pass for now, but thanks for the offer!",
    time: "May 10",
    rating: 4,
    distance: "4.2 mi away"
  },
  {
    id: "12",
    name: "Quinn Wilson",
    lastMessage: "Sorry for the late reply. Is this still available?",
    time: "May 5",
    rating: 3,
    distance: "6.7 mi away"
  }
];
