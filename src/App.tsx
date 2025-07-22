
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/providers/AuthProvider";
import Home from "./pages/Home";
import PostItem from "./pages/PostItem";
import EditItem from "./pages/EditItem";
import ItemDetails from "./pages/ItemDetails";
import Messages from "./pages/Messages";
import Messages3 from "./pages/Messages3";
import OtherPersonProfile from "./pages/OtherPersonProfile";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import ProfileDuplicate from "./pages/ProfileDuplicate";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import UserProfile from "./pages/UserProfile";
import Trades from "./pages/Trades";
import Test from "./pages/Test";
import OtherProfile from "./pages/OtherProfile";
import RequireAuth from "./components/auth/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Test />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/test" element={<Test />} />
              <Route path="/trades" element={
                <RequireAuth>
                  <Trades />
                </RequireAuth>
              } />
              <Route path="/item/:itemId" element={<ItemDetails />} />
              <Route path="/post-item" element={
                <RequireAuth>
                  <PostItem />
                </RequireAuth>
              } />
              <Route path="/edit-item/:itemId" element={
                <RequireAuth>
                  <EditItem />
                </RequireAuth>
              } />
              <Route path="/messages" element={
                <RequireAuth>
                  <Messages />
                </RequireAuth>
              } />
              <Route path="/your-match-opportunities" element={
                <RequireAuth>
                  <Messages3 />
                </RequireAuth>
              } />
              <Route path="/other-person-profile" element={<OtherPersonProfile />} />
              <Route path="/other-profile/:userId" element={<OtherProfile />} />
              <Route path="/notifications" element={
                <RequireAuth>
                  <Notifications />
                </RequireAuth>
              } />
              <Route path="/profile" element={
                <RequireAuth>
                  <UserProfile />
                </RequireAuth>
              } />
              <Route path="/profile-duplicate" element={
                <RequireAuth>
                  <ProfileDuplicate />
                </RequireAuth>
              } />
              <Route path="/settings" element={
                <RequireAuth>
                  <Settings />
                </RequireAuth>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
