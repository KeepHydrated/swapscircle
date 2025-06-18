
import { useState } from "react";
import Header from "@/components/layout/Header";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import ConversationList from "@/components/messages/ConversationList";
import ChatArea from "@/components/messages/ChatArea";
import DetailsPanel from "@/components/messages/DetailsPanel";
import MessagesLayout from "@/components/messages/MessagesLayout";
import { useConversations } from "@/hooks/useConversations";

// Simple placeholder for ConfirmRideDialogWrapper since it doesn't exist
const ConfirmRideDialogWrapper = ({ 
  isOpen, setIsOpen, onConfirm, selectedConversation 
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onConfirm: () => void;
  selectedConversation: any;
}) => (
  <div className={`${isOpen ? 'block' : 'hidden'}`}>
    <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setIsOpen(false)}>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Confirm Ride</h3>
        <p className="text-gray-600 mb-4">Are you sure you want to confirm this ride?</p>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              onConfirm();
              setIsOpen(false);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Confirm
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
);

const Test2 = () => {
  const navigate = useNavigate();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [showMyDetails, setShowMyDetails] = useState(true);
  
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    activeChat,
    selectedPair,
    dynamicExchangePairs,
    selectedPairId,
    handlePairSelect,
    handleSendFirstMessage,
    handleTradeCompleted
  } = useConversations();

  // Function to handle confirming the ride
  const handleConfirmClick = () => {
    console.log("Opening confirm ride dialog...");
    setConfirmDialogOpen(true);
  };
  
  // Function called when ride is confirmed
  const handleRideConfirmed = () => {
    console.log("Ride confirmed!");
    toast({
      title: "Ride Confirmed",
      description: "You've successfully confirmed this ride.",
    });
  };

  // Updated detailed ride information for "My Details"
  const myRideDetails = {
    from: "Bill Miller BBQ, 4500 Broadway, San Antonio, TX 78209",
    to: "Bakery Lorraine at the Pearl, 306 Pearl Pkwy #110, San Antonio, TX 78215",
    date: "May 10-12, 16-18, 2025",
    time: "8:00 AM - 9:00 AM",
    preferences: ["No smoking", "Quiet ride", "Light luggage"]
  };

  // Function to toggle between rider and my details
  const toggleDetailsView = () => {
    setShowMyDetails(!showMyDetails);
  };

  return (
    <>
      <MessagesLayout 
        exchangePairs={dynamicExchangePairs}
        selectedPairId={selectedPairId}
        onPairSelect={handlePairSelect}
        conversations={conversations}
        activeConversation={activeConversation}
        setActiveConversation={setActiveConversation}
        activeChat={activeChat}
        selectedPair={selectedPair}
        onSendFirstMessage={handleSendFirstMessage}
        onTradeCompleted={handleTradeCompleted}
      />

      {/* Confirm Ride Dialog */}
      <ConfirmRideDialogWrapper
        isOpen={confirmDialogOpen}
        setIsOpen={setConfirmDialogOpen}
        onConfirm={handleRideConfirmed}
        selectedConversation={activeChat}
      />
    </>
  );
};

export default Test2;
