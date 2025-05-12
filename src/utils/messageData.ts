
import { MessagesByChat } from "@/types/message";

// Sample messages for specific chats
export const messagesByChat: MessagesByChat = {
  // Default messages for any chat
  default: [
    {
      id: '1',
      content: "Hi there! I'm interested in trading my item for yours. Is it still available?",
      sender: 'user',
      timestamp: '10:30 AM'
    },
    {
      id: '2',
      content: "Hello! Yes, it's still available. I'd be happy to discuss a trade.",
      sender: 'other',
      timestamp: '10:32 AM'
    },
    {
      id: '3',
      content: "Great! What condition is your item in? I've had mine for about 3 months and it's practically new.",
      sender: 'user',
      timestamp: '10:35 AM'
    },
    {
      id: '4',
      content: "It's in excellent condition. I've only used it a few times. Would you be open to meeting somewhere to exchange?",
      sender: 'other',
      timestamp: '10:38 AM'
    },
    {
      id: '5',
      content: "Absolutely! There's a coffee shop downtown that would be perfect. How about this weekend?",
      sender: 'user',
      timestamp: '10:40 AM'
    },
    {
      id: '6',
      content: "This weekend works for me. Saturday around 2pm?",
      sender: 'other',
      timestamp: '10:42 AM'
    },
    {
      id: '7',
      content: "Perfect! I'll see you then. Looking forward to the exchange!",
      sender: 'user',
      timestamp: '10:45 AM'
    },
    {
      id: '8',
      content: "Great! Looking forward to it as well. I'll bring the item in its original packaging.",
      sender: 'other',
      timestamp: '10:47 AM'
    }
  ],
  // Sarah Johnson conversation
  "2": [
    {
      id: '1',
      content: "Hi Sarah! I saw your listing and I'm really interested in your vintage record player.",
      sender: 'user',
      timestamp: 'Yesterday, 2:15 PM'
    },
    {
      id: '2',
      content: "Hello! Thanks for reaching out. The record player is still available. What would you like to trade for it?",
      sender: 'other',
      timestamp: 'Yesterday, 2:30 PM'
    },
    {
      id: '3',
      content: "I have a barely used espresso machine that I think would be a fair trade. It's only 6 months old.",
      sender: 'user',
      timestamp: 'Yesterday, 2:45 PM'
    },
    {
      id: '4',
      content: "That sounds interesting! Do you have any photos of it?",
      sender: 'other',
      timestamp: 'Yesterday, 3:00 PM'
    },
    {
      id: '5',
      content: "Just sent them to you via the app. Let me know what you think!",
      sender: 'user',
      timestamp: 'Yesterday, 3:10 PM'
    },
    {
      id: '6',
      content: "Thanks! The espresso machine looks great. Would you like to meet up sometime this week?",
      sender: 'other',
      timestamp: 'Today, 10:30 AM'
    }
  ],
  // Michael Thompson conversation
  "3": [
    {
      id: '1',
      content: "Hi Michael, I'm interested in your mountain bike. Is it still up for trade?",
      sender: 'user',
      timestamp: 'Yesterday, 9:00 AM'
    },
    {
      id: '2',
      content: "Hey there! Yes, it's still available. What are you offering?",
      sender: 'other',
      timestamp: 'Yesterday, 9:30 AM'
    },
    {
      id: '3',
      content: "I have a drone that I've only used a few times. It's in great condition with all accessories.",
      sender: 'user',
      timestamp: 'Yesterday, 10:00 AM'
    },
    {
      id: '4',
      content: "That sounds like a fair trade. The bike is also in great shape. I just tuned it up last month.",
      sender: 'other',
      timestamp: 'Yesterday, 10:15 AM'
    },
    {
      id: '5',
      content: "Perfect! When would be a good time to meet?",
      sender: 'user',
      timestamp: 'Yesterday, 11:00 AM'
    },
    {
      id: '6',
      content: "I can drop it off this weekend if that works for you.",
      sender: 'other',
      timestamp: 'Today, 9:15 AM'
    }
  ]
};

// Function to get messages by chat ID
export const getMessagesByChatId = (chatId: string): ChatMessage[] => {
  return messagesByChat[chatId] || messagesByChat.default;
};
