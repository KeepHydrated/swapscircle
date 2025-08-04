
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
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async () => {
    if (!messageInput.trim() && selectedImages.length === 0) return;
    if (!conversationId) return;

    setIsUploading(true);
    try {
      let imageUrls: string[] = [];

      // Upload images if selected
      if (selectedImages.length > 0) {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          toast.error("You must be logged in to send images");
          return;
        }

        // Upload all images
        const uploadPromises = selectedImages.map(async (image, index) => {
          const fileExt = image.name.split('.').pop();
          const fileName = `${userData.user.id}/${Date.now()}-${index}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('message-attachments')
            .upload(fileName, image);

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error(`Failed to upload image ${index + 1}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from('message-attachments')
            .getPublicUrl(uploadData.path);

          return publicUrl;
        });

        try {
          imageUrls = await Promise.all(uploadPromises);
        } catch (error) {
          toast.error("Failed to upload one or more images");
          return;
        }
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
          message: messageInput.trim() || (selectedImages.length > 0 ? `Sent ${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''}` : ""),
          image_urls: imageUrls
        });

      if (messageError) {
        console.error('Message error:', messageError);
        toast.error("Failed to send message");
        return;
      }

      // Clear inputs
      setMessageInput("");
      setSelectedImages([]);
      setImagePreviews([]);
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
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Filter only image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast.error("Only image files are allowed");
    }

    if (imageFiles.length === 0) return;

    // Check total file count (max 5 images)
    const totalImages = selectedImages.length + imageFiles.length;
    if (totalImages > 5) {
      toast.error("Maximum 5 images allowed per message");
      return;
    }

    // Check file sizes (max 5MB each)
    const oversizedFiles = imageFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error("Each image must be less than 5MB");
      return;
    }

    // Add new images to existing selection
    const newImages = [...selectedImages, ...imageFiles];
    setSelectedImages(newImages);
    
    // Create previews for new images
    const newPreviews: string[] = [];
    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === imageFiles.length) {
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearAllImages = () => {
    setSelectedImages([]);
    setImagePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-3 bg-white border-t border-gray-200 w-full">
      {/* Image previews */}
      {imagePreviews.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllImages}
              className="h-6 text-xs"
            >
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img 
                  src={preview} 
                  alt={`Preview ${index + 1}`} 
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="shrink-0"
          onClick={handleFileSelect}
          disabled={isUploading || selectedImages.length >= 5}
          title={selectedImages.length >= 5 ? "Maximum 5 images allowed" : "Attach images"}
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
          disabled={(!messageInput.trim() && selectedImages.length === 0) || isUploading}
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
