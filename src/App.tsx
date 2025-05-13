
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PostItem from "./pages/PostItem";
import Messages from "./pages/Messages";
import Messages2 from "./pages/Messages2";
import Profile from "./pages/Profile";
import OtherPersonProfile from "./pages/ProfileDuplicate"; // Updated this import
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post-item" element={<PostItem />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages2" element={<Messages2 />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile-duplicate" element={<OtherPersonProfile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
