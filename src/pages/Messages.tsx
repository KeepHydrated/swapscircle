
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import MessagesLayout from '@/components/messages/MessagesLayout';
import { useTradeConversations } from '@/hooks/useTradeConversations';

const Messages = () => {
  const {
    conversations,
    exchangePairs,
    activeConversation,
    setActiveConversation,
    activeChat,
    selectedPair,
    selectedPairId,
    handlePairSelect,
    handleSendFirstMessage,
    handleTradeCompleted,
    loading
  } = useTradeConversations();

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Item exchange carousel - fixed position with z-index to ensure it stays on top */}
        <div className="w-full border-b border-gray-200 bg-white z-20 h-24 flex items-center px-2 sticky top-0">
          {exchangePairs.length > 0 ? (
            <div className="w-full">
              <div className="flex gap-4 overflow-x-auto pb-2">
                {exchangePairs.map((pair) => (
                  <div
                    key={pair.id}
                    className={`flex-shrink-0 cursor-pointer rounded-lg p-3 border-2 transition-all ${
                      selectedPairId === pair.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePairSelect(pair.partnerId, pair.id)}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={pair.item1.image} 
                        alt={pair.item1.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <span className="text-sm">↔</span>
                      <img 
                        src={pair.item2.image} 
                        alt={pair.item2.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-xs text-gray-600 truncate max-w-[120px]">
                        {pair.item1.name} ↔ {pair.item2.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full text-center py-8">
              <p className="text-gray-500">No trade conversations yet</p>
              <p className="text-sm text-gray-400">Start trading to see conversations here!</p>
            </div>
          )}
        </div>
        
        {/* Three columns with consistent header heights */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar - Conversations */}
          <div className="w-[350px] border-r border-gray-200 overflow-hidden flex flex-col">
            {conversations.length > 0 ? (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-white h-16 flex items-center">
                  <h2 className="font-semibold">Trade Conversations</h2>
                </div>
                
                {/* Conversations list */}
                <div className="flex-1 overflow-y-auto">
                  {conversations.map((conversation) => {
                    const exchangePair = exchangePairs.find(pair => pair.partnerId === conversation.id);
                    
                    return (
                      <div 
                        key={conversation.id}
                        className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${activeConversation === conversation.id ? 'bg-gray-50' : ''}`}
                        onClick={() => setActiveConversation(conversation.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-purple-800 font-medium text-sm">
                              {conversation.name.substring(0, 2)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <h3 className="font-medium truncate">{conversation.name}</h3>
                              <span className="text-xs text-gray-500 flex-shrink-0">{conversation.time}</span>
                            </div>
                            
                            {/* Exchange item display */}
                            {exchangePair && (
                              <div className="flex items-center mb-1 text-xs">
                                <span className="truncate text-gray-900 max-w-[80px] inline-block">{exchangePair.item1.name}</span>
                                <span className="mx-1 text-blue-600">↔</span>
                                <span className="truncate text-gray-900 max-w-[80px] inline-block">{exchangePair.item2.name}</span>
                              </div>
                            )}
                            
                            <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-500">No conversations yet</p>
                  <p className="text-sm text-gray-400 mt-2">Start trading to begin conversations!</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Middle - Chat area */}
          <div className="flex-1 overflow-hidden">
            {activeConversation ? (
              <div className="flex flex-col h-full">
                {/* Chat header */}
                <div className="p-4 border-b border-gray-200 bg-white h-16 flex items-center">
                  <h3 className="font-medium">{activeChat.name}</h3>
                  {selectedPair && (
                    <div className="ml-4 text-sm text-gray-500">
                      Trading: {selectedPair.item1.name} ↔ {selectedPair.item2.name}
                    </div>
                  )}
                </div>
                
                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  <div className="text-center py-8">
                    <p className="text-gray-500">Trade conversation started!</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Send messages to discuss the trade details.
                    </p>
                  </div>
                </div>
                
                {/* Message input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                    />
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
          
          {/* Right sidebar - Details panel */}
          <div className="w-80 border-l border-gray-200 bg-gray-50">
            {selectedPair ? (
              <div className="p-4">
                <h3 className="font-medium mb-4">Trade Details</h3>
                
                {/* Item 1 */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Your Item</h4>
                  <div className="bg-white rounded-lg p-3 border">
                    <img 
                      src={selectedPair.item1.image} 
                      alt={selectedPair.item1.name}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                    <p className="font-medium text-sm">{selectedPair.item1.name}</p>
                  </div>
                </div>
                
                {/* Exchange indicator */}
                <div className="text-center mb-4">
                  <span className="text-blue-600 text-lg">↕</span>
                </div>
                
                {/* Item 2 */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Their Item</h4>
                  <div className="bg-white rounded-lg p-3 border">
                    <img 
                      src={selectedPair.item2.image} 
                      alt={selectedPair.item2.name}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                    <p className="font-medium text-sm">{selectedPair.item2.name}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-center">
                  Select a trade conversation<br />
                  to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
