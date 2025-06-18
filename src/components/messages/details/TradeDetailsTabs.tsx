
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, Home, Utensils, DollarSign, MapPin, Clock, Calendar, X } from 'lucide-react';
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
          <div className="bg-gray-50 rounded-lg p-3 border flex-1">
            <div className="flex items-center mb-3">
              <Avatar className="h-12 w-12 bg-gray-100 mr-3 flex-shrink-0">
                <AvatarImage src={selectedPair.item1.image} alt={selectedPair.item1.name} />
                <AvatarFallback>{selectedPair.item1.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{selectedPair.item1.name}</p>
                <p className="text-xs text-gray-600">Your Item</p>
              </div>
            </div>
            
            <div className="mb-3">
              <p className="text-gray-700 text-xs mt-1 bg-white p-2 rounded-md">
                Like new condition. This item has been gently used and well maintained. Perfect for anyone looking for a high-quality {selectedPair.item1.name.toLowerCase()} at a great value.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mr-1">
                  <Check className="w-2 h-2 text-green-600" />
                </div>
                <span className="text-gray-800 text-xs">Brand New</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mr-1">
                  <DollarSign className="w-2 h-2 text-green-600" />
                </div>
                <span className="text-gray-800 text-xs">$100 - $250</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center mr-1">
                  <Home className="w-2 h-2 text-blue-600" />
                </div>
                <span className="text-gray-800 text-xs">Home & Garden</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center mr-1">
                  <Utensils className="w-2 h-2 text-purple-600" />
                </div>
                <span className="text-gray-800 text-xs">Kitchen</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-3 border flex-1">
            <div className="flex items-center mb-3">
              <Avatar className="h-12 w-12 bg-gray-100 mr-3 flex-shrink-0">
                <AvatarImage src={selectedPair.item2.image} alt={selectedPair.item2.name} />
                <AvatarFallback>{selectedPair.item2.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{selectedPair.item2.name}</p>
                <p className="text-xs text-gray-600">Their Item</p>
              </div>
            </div>
            
            <div className="mb-3">
              <p className="text-gray-700 text-xs mt-1 bg-white p-2 rounded-md">
                Excellent condition. This {selectedPair.item2.name.toLowerCase()} has been well-cared for and is ready for a new home. Great quality and functionality.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mr-1">
                  <Check className="w-2 h-2 text-green-600" />
                </div>
                <span className="text-gray-800 text-xs">Excellent</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mr-1">
                  <DollarSign className="w-2 h-2 text-green-600" />
                </div>
                <span className="text-gray-800 text-xs">$150 - $300</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center mr-1">
                  <Home className="w-2 h-2 text-blue-600" />
                </div>
                <span className="text-gray-800 text-xs">Electronics</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center mr-1">
                  <Utensils className="w-2 h-2 text-purple-600" />
                </div>
                <span className="text-gray-800 text-xs">Tech</span>
              </div>
            </div>
            
            {/* Owner information */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center mb-2">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&h=250&auto=format&fit=crop" />
                  <AvatarFallback>EW</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-xs font-semibold">Emma Wilson</h4>
                  <div className="flex text-amber-400 text-xs">★★★★★ <span className="text-gray-500 ml-1">(42)</span></div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-2.5 w-2.5 mr-1" />
                  <span>Since 2023</span>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="h-2.5 w-2.5 mr-1" />
                  <span>2.3 mi away</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-2.5 w-2.5 mr-1" />
                  <span>~1 hour</span>
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
