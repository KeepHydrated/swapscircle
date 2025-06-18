import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, Home, Utensils, DollarSign, MapPin, Clock, Calendar, X, Tag, Layers, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { updateTradeStatus } from '@/services/tradeService';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchUserTradeConversations } from '@/services/tradeService';

interface TradeDetailsTabsProps {
  selectedPair: {
    id: number;
    item1: { name: string; image: string };
    item2: { name: string; image: string };
    partnerId: string;
  };
  selectedItem: 'item1' | 'item2';
  onSelectItem: (item: 'item1' | 'item2') => void;
}

const TradeDetailsTabs: React.FC<TradeDetailsTabsProps> = ({
  selectedPair,
  selectedItem,
  onSelectItem
}) => {
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Sample images for the carousel (you can replace these with actual item images)
  const itemImages = [
    selectedPair.item1.image || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=400&auto=format&fit=crop"
  ];

  // Sample images for their item
  const theirItemImages = [
    selectedPair.item2.image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1487887235947-a955ef187fcc?w=400&h=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1515378791036-0648a814c963?w=400&h=400&auto=format&fit=crop"
  ];

  // Fetch trade status to check if already accepted
  const { data: tradeConversations = [] } = useQuery({
    queryKey: ['trade-conversations'],
    queryFn: fetchUserTradeConversations,
  });

  const currentTrade = tradeConversations.find((tc: any) => tc.id === selectedPair.partnerId);
  const isTradeAccepted = currentTrade?.status === 'accepted' || currentTrade?.status === 'completed';

  const acceptTradeMutation = useMutation({
    mutationFn: () => updateTradeStatus(selectedPair.partnerId, 'accepted'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-conversations'] });
      toast.success('Trade accepted successfully!');
    },
    onError: (error) => {
      console.error('Error accepting trade:', error);
      toast.error('Failed to accept trade. Please try again.');
    },
  });

  const rejectTradeMutation = useMutation({
    mutationFn: () => updateTradeStatus(selectedPair.partnerId, 'rejected'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-conversations'] });
      toast.success('Trade rejected.');
    },
    onError: (error) => {
      console.error('Error rejecting trade:', error);
      toast.error('Failed to reject trade. Please try again.');
    },
  });

  const handleAcceptTrade = () => {
    acceptTradeMutation.mutate();
  };

  const handleRejectTrade = () => {
    rejectTradeMutation.mutate();
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? itemImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === itemImages.length - 1 ? 0 : prev + 1));
  };

  const handlePrevTheirImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? theirItemImages.length - 1 : prev - 1));
  };

  const handleNextTheirImage = () => {
    setCurrentImageIndex((prev) => (prev === itemImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="p-4 border-b border-gray-200 bg-white flex flex-col h-full">
      <h3 className="font-medium mb-4">Trade Details</h3>
      
      {/* Item Selector */}
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSelectItem('item1')}
            className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
              selectedItem === 'item1' 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            Your Item
          </button>
          <button
            onClick={() => onSelectItem('item2')}
            className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
              selectedItem === 'item2' 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            Their Item
          </button>
        </div>
      </div>
      
      {/* Item Details Content */}
      <div className="flex-1 flex flex-col">
        {selectedItem === 'item1' ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Item Image with Navigation */}
            <div className="relative aspect-square bg-gray-100 w-full h-32">
              <img 
                src={itemImages[currentImageIndex]} 
                alt={selectedPair.item1.name} 
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
              
              {/* Image Counter */}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs rounded-full px-2 py-1">
                {currentImageIndex + 1}/{itemImages.length}
              </div>
            </div>
            
            {/* Item Details */}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{selectedPair.item1.name}</h3>
              <p className="text-gray-600 text-sm mb-3">
                Beautiful vintage 35mm film camera in excellent working condition. Perfect for photography enthusiasts.
              </p>
              
              {/* Property Tags */}
              <div className="grid grid-cols-2 gap-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span>Electronics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-gray-500" />
                  <span>Cameras</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span>Excellent</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span>$150 - $200</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Their Item Image with Navigation */}
            <div className="relative aspect-square bg-gray-100 w-full h-32">
              <img 
                src={theirItemImages[currentImageIndex]} 
                alt={selectedPair.item2.name} 
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              <button
                onClick={handlePrevTheirImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              
              <button
                onClick={handleNextTheirImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
              
              {/* Image Counter */}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs rounded-full px-2 py-1">
                {currentImageIndex + 1}/{theirItemImages.length}
              </div>
            </div>
            
            {/* Their Item Details */}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{selectedPair.item2.name}</h3>
              <p className="text-gray-600 text-sm mb-3">
                Excellent condition. This {selectedPair.item2.name.toLowerCase()} has been well-cared for and is ready for a new home. Great quality and functionality.
              </p>
              
              {/* Property Tags */}
              <div className="grid grid-cols-2 gap-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span>Electronics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-gray-500" />
                  <span>Tech</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span>Excellent</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span>$150 - $300</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Action buttons at the bottom or accepted status */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          {isTradeAccepted ? (
            <div className="flex items-center justify-center py-3 bg-green-50 rounded-lg border border-green-200">
              <Check className="w-5 h-5 mr-2 text-green-600" />
              <span className="text-green-700 font-medium">Trade Accepted</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleRejectTrade}
                disabled={rejectTradeMutation.isPending}
              >
                <X className="w-4 h-4 mr-2" />
                {rejectTradeMutation.isPending ? 'Rejecting...' : 'Reject'}
              </Button>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleAcceptTrade}
                disabled={acceptTradeMutation.isPending}
              >
                <Check className="w-4 h-4 mr-2" />
                {acceptTradeMutation.isPending ? 'Accepting...' : 'Accept'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeDetailsTabs;
