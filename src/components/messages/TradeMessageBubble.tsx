import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

interface TradeMessageBubbleProps {
  message: {
    id: string;
    message: string;
    sender_id: string;
    created_at: string;
    image_urls?: string[];
    sender_profile?: {
      id: string;
      username: string;
      name?: string;
      avatar_url?: string;
    };
  };
  senderName: string;
  onImageLoad?: () => void;
}

const TradeMessageBubble = ({ message, senderName, onImageLoad }: TradeMessageBubbleProps) => {
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const isUserMessage = currentUserId === message.sender_id;

  return (
    <div 
      className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex items-end gap-2 max-w-[70%] ${isUserMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isUserMessage && (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-purple-100 text-purple-800">
              {(message.sender_profile?.username || senderName).substring(0, 2)}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={`rounded-2xl px-4 py-2 ${
          isUserMessage 
            ? 'bg-blue-500 text-white rounded-tr-none' 
            : 'bg-gray-100 text-gray-800 rounded-tl-none'
        }`}>
          <p>{message.message}</p>
          {message.image_urls && message.image_urls.length > 0 && (
            <div className="mt-2 grid gap-2" style={{
              gridTemplateColumns: message.image_urls.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(120px, 1fr))'
            }}>
              {message.image_urls.map((url, index) => (
                <img 
                  key={index}
                  src={url} 
                  alt={`Attachment ${index + 1}`}
                  className="rounded-lg max-w-full h-auto"
                  style={{
                    maxHeight: message.image_urls!.length === 1 ? '200px' : '120px',
                    objectFit: 'cover'
                  }}
                  onLoad={onImageLoad}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeMessageBubble;