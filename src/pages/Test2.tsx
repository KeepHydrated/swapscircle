
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { UserRound, ChevronDown, ChevronUp, PenLine, MessageCircle, Calendar, Clock, ArrowRight, Navigation, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

// Simple placeholder components for missing ones
const MatchesList = ({ filter, showFilter }: { filter: string; showFilter: boolean }) => (
  <div className="space-y-4">
    <div className="text-center text-gray-500 py-8">
      Matches for {filter} will be displayed here
    </div>
  </div>
);

const RideRequestCard = ({ 
  id, from, to, date, time, description, onEdit, showEditButton, addTopPadding 
}: {
  id: number;
  from: string;
  to: string;
  date: string;
  time: string;
  description: string;
  onEdit: () => void;
  showEditButton: boolean;
  addTopPadding: boolean;
}) => (
  <Card className={`${addTopPadding ? 'pt-12' : ''}`}>
    <CardContent className="p-6">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">From</span>
            </div>
            <p className="text-gray-700">{from}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">To</span>
            </div>
            <p className="text-gray-700">{to}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Date</span>
            </div>
            <p className="text-gray-600">{date}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Time</span>
            </div>
            <p className="text-gray-600">{time}</p>
          </div>
        </div>
        
        <div>
          <p className="text-gray-700 text-sm">{description}</p>
        </div>
        
        {showEditButton && (
          <div className="flex justify-end">
            <Button onClick={onEdit} variant="outline" size="sm">
              <PenLine className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const RequestRiderDialog = ({ 
  open, onOpenChange, initialData, onSave 
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: any;
  onSave: (data: any) => void;
}) => (
  <div className={`${open ? 'block' : 'hidden'}`}>
    {/* Simple placeholder dialog */}
    <div className="fixed inset-0 bg-black/50 z-50" onClick={() => onOpenChange(false)}>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Edit Ride Request</h3>
        <p className="text-gray-600 mb-4">Edit functionality coming soon...</p>
        <Button onClick={() => onOpenChange(false)}>Close</Button>
      </div>
    </div>
  </div>
);

const Test2 = () => {
  const navigate = useNavigate();
  const [activeRequestIndex, setActiveRequestIndex] = useState(0);
  const [matchType, setMatchType] = useState<"drivers" | "riders">("drivers");
  const [mode, setMode] = useState<"rider" | "driver">("rider");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const [searchRequests, setSearchRequests] = useState([
    {
      id: 1,
      from: "Bill Miller BBQ, 4500 Broadway, San Antonio, TX 78209",
      fromZipcode: "78209",
      to: "Bakery Lorraine at the Pearl, 306 Pearl Pkwy #110, San Antonio, TX 78215",
      toZipcode: "78215",
      date: "May 15-19",
      time: "8:30 AM - 9:30 AM",
    },
    {
      id: 2,
      from: "Bill Miller BBQ, 4500 Broadway, San Antonio, TX 78209",
      fromZipcode: "78209",
      to: "Seattle, WA",
      toZipcode: "98101",
      date: "May 12-15, 20-22",
      time: "7:30 AM - 8:30 AM",
    }
  ]);

  const handleModeChange = (newMode: "rider" | "driver") => {
    console.log("Index received mode change:", newMode);
    setMode(newMode);
    if (newMode === "rider") {
      setMatchType("drivers");
    } else {
      setMatchType("riders");
    }
  };

  const handleProfileNavigation = (selectedMode: "rider" | "driver") => {
    if (selectedMode === "rider") {
      navigate("/rider-profile");
    } else {
      navigate("/driver-profile");
    }
  };
  
  const handlePreviousRequest = () => {
    if (activeRequestIndex > 0) {
      setActiveRequestIndex(activeRequestIndex - 1);
    }
  };
  
  const handleNextRequest = () => {
    if (activeRequestIndex < searchRequests.length - 1) {
      setActiveRequestIndex(activeRequestIndex + 1);
    }
  };
  
  const handleEditRequest = () => {
    setEditDialogOpen(true);
  };

  const handleSaveRequest = (updatedRequest: any) => {
    const updatedRequests = [...searchRequests];
    const index = updatedRequests.findIndex(req => req.id === updatedRequest.id);
    
    if (index !== -1) {
      updatedRequests[index] = updatedRequest;
      setSearchRequests(updatedRequests);
    }
  };

  const currentRequest = searchRequests[activeRequestIndex];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 z-10">
        <Header />
      </div>

      <main className="w-full max-w-[100%] mx-auto px-4 py-6 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-[#1A1F2C]">Ride Request</h2>
            </div>

            <div className="relative">
              {/* Pagination controls positioned at the top of the card */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-md px-2 py-1">
                <button
                  onClick={handlePreviousRequest}
                  disabled={activeRequestIndex === 0}
                  className="h-5 w-5 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-50 text-gray-500"
                >
                  <ChevronDown className="h-3 w-3 rotate-90" />
                </button>
                <span className="text-xs text-gray-500">
                  {activeRequestIndex + 1} of {searchRequests.length}
                </span>
                <button
                  onClick={handleNextRequest}
                  disabled={activeRequestIndex === searchRequests.length - 1}
                  className="h-5 w-5 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-50 text-gray-500"
                >
                  <ChevronDown className="h-3 w-3 -rotate-90" />
                </button>
              </div>

              <RideRequestCard
                id={currentRequest.id}
                from={currentRequest.from}
                to={currentRequest.to}
                date={currentRequest.date}
                time={currentRequest.time}
                description="Looking for a ride from the airport to downtown. Flight lands at 5:45 PM. Will have one carry-on bag. Can pay via Venmo or cash. Thanks!"
                onEdit={handleEditRequest}
                showEditButton={true}
                addTopPadding={true}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-[#1A1F2C] mb-3">{matchType === "drivers" ? "Matching Drive Offers" : "Matching Riders"}</h2>
            <ScrollArea className="h-[calc(100vh-12rem)] pr-2 rounded-md">
              <MatchesList filter={matchType} showFilter={false} />
            </ScrollArea>
          </div>
        </div>
      </main>

      <RequestRiderDialog 
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        initialData={currentRequest}
        onSave={handleSaveRequest}
      />
    </div>
  );
};

export default Test2;
