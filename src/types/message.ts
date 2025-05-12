
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'other';
  timestamp: string;
}

export type MessagesByChat = Record<string, ChatMessage[]>;
