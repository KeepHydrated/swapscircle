
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
import UserProfile from "./pages/UserProfile";

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
          <Route path="/user/:userId" element={<UserProfile />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
