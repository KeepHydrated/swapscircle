import React, { useState } from 'react';
import { Plus, User, Settings, LogOut, MessageCircle, LogIn, AlertTriangle, Handshake, Flag, FileText, Headphones, Heart, ArrowLeftRight, BarChart3, Search, Lightbulb } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import HeaderLocationSelector from './HeaderLocationSelector';
import NotificationDropdown from './NotificationDropdown';
import MobileProfileSidebar from './MobileProfileSidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useNotifications } from '@/hooks/useUnreadNotifications';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIsNativeApp } from '@/hooks/useIsNativeApp';

const Header = () => {
  const { user, signOut, supabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markDropdownAsViewed, markAllAsRead } = useNotifications();
  const isMobile = useIsMobile();
  const isNativeApp = useIsNativeApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await signOut();
  };

  const handleLogin = () => {
    if (!supabaseConfigured) {
      toast.error("Supabase is not configured. Please add environment variables to enable authentication.", {
        duration: 5000,
      });
      return;
    }
    navigate('/auth');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Check if we're on the auth page to avoid showing login button there
  const isAuthPage = window.location.pathname === '/auth';

  return (
    <>
      <header className="fixed top-0 z-[9999] w-full bg-white border-b border-gray-200 shadow-sm pointer-events-auto overflow-visible">
        <div className="relative flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center space-x-3">
            
            <Link to="/" className="flex items-center">
              {!isMobile && <h1 className="text-2xl font-bold text-trademate-blue">SwapsCircle</h1>}
            </Link>
            
            {/* Search bar - desktop only */}
            {!isMobile && (
              <form onSubmit={handleSearch} className="relative ml-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </form>
            )}
          </div>

          {/* Mobile M button - far left */}
          {isMobile && (
            <Link to="/matches" className="absolute left-4">
              <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                <span className="text-sm font-semibold text-white">M</span>
              </div>
            </Link>
          )}

          {/* Mobile center icons */}
          {isMobile && (
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-12">
              <Link to="/post-item">
                <Plus className="h-6 w-6 text-gray-500" />
              </Link>
              <Link to="/">
                <ArrowLeftRight className="h-6 w-6 text-gray-500" />
              </Link>
              <Link to="/messages">
                <MessageCircle className="h-6 w-6 text-gray-500" />
              </Link>
            </div>
          )}

          <div className="flex items-center space-x-2">
            {!supabaseConfigured && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="text-amber-500">
                      <AlertTriangle className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Supabase is not configured. Some features may not work.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Button variant="default" size="sm" className="hidden md:flex bg-gray-900 hover:bg-gray-800 text-white" asChild>
              <Link to="/matches">
                <span>Matches</span>
              </Link>
            </Button>

            <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
              <Link to="/post-item">
                <Plus className="w-5 h-5" />
                <span className="sr-only">Post Item</span>
              </Link>
            </Button>
            
            <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
              <Link to="/messages">
                <MessageCircle className="w-5 h-5" />
                <span className="sr-only">Messages</span>
              </Link>
            </Button>
            
            <NotificationDropdown notifications={notifications} unreadCount={unreadCount} onNotificationRead={markAsRead} onDropdownViewed={markDropdownAsViewed} onMarkAllAsRead={markAllAsRead} />
            
            {/* Profile avatar - show different UI for logged in vs logged out */}
            {user ? (
              isMobile ? (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative h-8 w-8"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Avatar className="h-8 w-8">
                    {user?.avatar_url ? (
                      <AvatarImage src={user.avatar_url} alt={user.name || 'User'} />
                    ) : null}
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                      {user?.name ? getInitials(user.name) : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        {user?.avatar_url ? (
                          <AvatarImage src={user.avatar_url} alt={user.name || 'User'} />
                        ) : null}
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                          {user?.name ? getInitials(user.name) : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={8} className="w-48 bg-popover border border-border shadow-lg z-[10000]">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex w-full cursor-pointer items-center">
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/trades" className="flex w-full cursor-pointer items-center">
                        Trades
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/likes" className="flex w-full cursor-pointer items-center">
                        Likes
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex w-full cursor-pointer items-center">
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/customer-support" className="flex w-full cursor-pointer items-center">
                        Contact Support
                      </Link>
                    </DropdownMenuItem>
                    {(user?.name === 'NadiaHibri' || user?.email === 'nadiahsheriff@gmail.com') && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin/reports" className="flex w-full cursor-pointer items-center">
                          Admin Reports
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {supabaseConfigured && (
                      <>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem 
                          className="flex cursor-pointer items-center text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={handleLogout}
                        >
                          Log Out
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            ) : (
              // Show Log In button when not logged in - icon only on mobile
              isMobile ? (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleLogin}
                  className="h-8 w-8"
                >
                  <User className="h-5 w-5 text-muted-foreground" />
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handleLogin}
                  className="flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Log In</span>
                </Button>
              )
            )}
          </div>
        </div>
      </header>
      
      {/* Mobile Profile Sidebar */}
      <MobileProfileSidebar 
        open={mobileMenuOpen} 
        onOpenChange={setMobileMenuOpen} 
      />
    </>
  );
};

export default Header;