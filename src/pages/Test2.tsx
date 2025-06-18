
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import MatchesList from "@/components/MatchesList";
import { UserRound, ChevronDown, ChevronUp, PenLine, MessageCircle, Calendar, Clock, ArrowRight, Navigation, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import RequestRiderDialog from "@/components/RequestRiderDialog";
import RideRequestCard from "@/components/shared/RideRequestCard";

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
        <Header onModeChange={handleModeChange} onProfileClick={handleProfileNavigation} />
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
