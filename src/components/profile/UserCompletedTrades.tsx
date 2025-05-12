
import React from 'react';
import { Card } from '@/components/ui/card';
import { CompletedTrade } from '@/types/profile';

interface UserCompletedTradesProps {
  trades: CompletedTrade[];
}

const UserCompletedTrades: React.FC<UserCompletedTradesProps> = ({ trades }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {trades.map(item => (
        <Card key={item.id} className="overflow-hidden">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800">{item.tradedWith}</h3>
                <p className="text-xs text-gray-500">{item.tradeDate}</p>
              </div>
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                Completed
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row p-4">
            <div className="w-full sm:w-1/2 pb-4 sm:pb-0 sm:pr-2 border-b sm:border-b-0 sm:border-r">
              <div className="text-center mb-1 text-sm text-gray-600 font-medium">They traded:</div>
              <div className="h-40 overflow-hidden mb-2">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-center text-sm">{item.name}</p>
            </div>
            <div className="w-full sm:w-1/2 pt-4 sm:pt-0 sm:pl-2">
              <div className="text-center mb-1 text-sm text-gray-600 font-medium">For:</div>
              <div className="h-40 overflow-hidden mb-2">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f" 
                  alt={item.tradedFor} 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-center text-sm">{item.tradedFor}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default UserCompletedTrades;
