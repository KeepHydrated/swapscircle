
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/providers/AuthProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LiveChatPopup from "@/components/chat/LiveChatPopup";

import PostItemNew from "./pages/PostItemNew";
import EditItem from "./pages/EditItem";
import ItemDetails from "./pages/ItemDetails";
import Messages from "./pages/Messages";
import Messages3 from "./pages/Messages3";
import OtherPersonProfile from "./pages/OtherPersonProfile";
import Notifications from "./pages/Notifications";
import NotificationDetails from "./pages/NotificationDetails";
import NotFound from "./pages/NotFound";
import PostingRules from "./pages/PostingRules";
import Auth from "./pages/Auth";
import SearchPage from "./pages/SearchPage";

import Settings from "./pages/Settings";
import UserProfile from "./pages/UserProfile";
import DemoProfile from "./pages/DemoProfile";
import Trades from "./pages/Trades";
import DemoTrades from "./pages/DemoTrades";
import Likes from "./pages/Likes";

import Test2 from "./pages/Test2";
import Test from "./pages/Test";

import AdminReports from "./pages/AdminReports";
import AdminUsers from "./pages/AdminUsers";
import Analytics from "./pages/Analytics";
import AdminCustomerSupport from "./pages/AdminCustomerSupport";
import RequireAuth from "./components/auth/RequireAuth";
import ScrollToTop from "./components/ScrollToTop";
import { usePageViewTracking } from "./hooks/usePageViewTracking";

const queryClient = new QueryClient();

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Test2 />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/trades"
        element={
          <RequireAuth>
            <Trades />
          </RequireAuth>
        }
      />
      <Route
        path="/likes"
        element={
          <RequireAuth>
            <Likes />
          </RequireAuth>
        }
      />
      <Route path="/item/:itemId" element={<ItemDetails />} />
      <Route path="/post-item" element={<PostItemNew />} />
      <Route
        path="/edit-item/:itemId"
        element={
          <RequireAuth>
            <PostItemNew />
          </RequireAuth>
        }
      />
      <Route
        path="/messages"
        element={
          <RequireAuth>
            <Messages />
          </RequireAuth>
        }
      />
      <Route
        path="/other-person-profile"
        element={
          <RequireAuth>
            <OtherPersonProfile />
          </RequireAuth>
        }
      />

      <Route
        path="/notifications"
        element={
          <RequireAuth>
            <Notifications />
          </RequireAuth>
        }
      />
      <Route
        path="/notifications/:id"
        element={
          <RequireAuth>
            <NotificationDetails />
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <UserProfile />
          </RequireAuth>
        }
      />
      <Route path="/demo-profile" element={<DemoProfile />} />
      <Route path="/demo-trades" element={<DemoTrades />} />
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <Settings />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <RequireAuth>
            <AdminReports />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RequireAuth>
            <AdminUsers />
          </RequireAuth>
        }
      />
      <Route
        path="/analytics"
        element={
          <RequireAuth>
            <Analytics />
          </RequireAuth>
        }
      />
      <Route path="/posting-rules" element={<PostingRules />} />
      <Route
        path="/admin-customer-support"
        element={
          <RequireAuth>
            <AdminCustomerSupport />
          </RequireAuth>
        }
      />
      <Route path="/matches" element={<Test />} />
      <Route path="/search" element={<SearchPage />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const AppContent = () => {
  usePageViewTracking();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <AppRoutes />
      </main>
      <Footer />
      <LiveChatPopup />
    </div>
  );
};

const App = () => {
  console.log("🚨 APP COMPONENT LOADING!");
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
