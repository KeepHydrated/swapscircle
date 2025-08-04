
import React, { useState, useRef } from 'react';
import { Paperclip, Send, X, Image } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MessageInputProps {
  onMarkCompleted?: () => void;
  conversationId?: string;
}

const MessageInput = ({ onMarkCompleted, conversationId }: MessageInputProps = {}) => {
  const [messageInput, setMessageInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async () => {
    if (!messageInput.trim() && !selectedImage) return;
    if (!conversationId) return;

    setIsUploading(true);
    try {
      let imageUrl = "";

      // Upload image if selected
      if (selectedImage) {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          toast.error("You must be logged in to send images");
          return;
        }

        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${userData.user.id}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('message-attachments')
          .upload(fileName, selectedImage);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error("Failed to upload image");
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('message-attachments')
          .getPublicUrl(uploadData.path);

        imageUrl = publicUrl;
      }

      // Send message to database
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("You must be logged in to send messages");
        return;
      }

      const { error: messageError } = await supabase
        .from('trade_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userData.user.id,
          message: messageInput.trim() || "Image",
          image_url: imageUrl || null
        });

      if (messageError) {
        console.error('Message error:', messageError);
        toast.error("Failed to send message");
        return;
      }

      // Clear inputs
      setMessageInput("");
      setSelectedImage(null);
      setImagePreview("");
      toast.success("Message sent!");

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-3 bg-white border-t border-gray-200 w-full">
      {/* Image preview */}
      {imagePreview && (
        <div className="mb-2 relative inline-block">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="max-w-32 max-h-32 rounded-lg object-cover"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={clearSelectedImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="shrink-0"
          onClick={handleFileSelect}
          disabled={isUploading}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        
        <Input 
          placeholder="Type a message..." 
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          className="flex-1"
          onKeyDown={handleKeyDown}
          disabled={isUploading}
        />
        
        <Button 
          onClick={handleSendMessage}
          disabled={(!messageInput.trim() && !selectedImage) || isUploading}
          size="icon"
          className="shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
