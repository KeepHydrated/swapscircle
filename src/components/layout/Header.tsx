import React, { useState } from 'react';
import { Plus, User, Settings, LogOut, MessageCircle, LogIn, AlertTriangle, Handshake, Flag, FileText, Headphones, Heart, ArrowLeftRight, BarChart3 } from 'lucide-react';
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
import { useModal } from '@/context/ModalContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useNotifications } from '@/hooks/useUnreadNotifications';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIsNativeApp } from '@/hooks/useIsNativeApp';

const Header = () => {
  const { user, signOut, supabaseConfigured } = useAuth();
  const { closeAllModals } = useModal();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markDropdownAsViewed, markAllAsRead } = useNotifications();
  const isMobile = useIsMobile();
  const isNativeApp = useIsNativeApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    navigate('/');
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

  // Check if we're on the auth page to avoid showing login button there
  const isAuthPage = window.location.pathname === '/auth';

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="relative flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center space-x-3">
            {/* Heart icon - only show on mobile */}
            {isMobile && (
              <Link to="/your-likes">
                <Heart className="h-4 w-4 text-gray-500" />
                <span className="sr-only">Your Likes</span>
              </Link>
            )}
            
            <Link to="/" className="flex items-center">
              {!isMobile && <h1 className="text-2xl font-bold text-trademate-blue">SwapsCircle</h1>}
            </Link>
            
            {/* Admin Customer Support, Reports and Analytics for specific user - desktop only */}
            {user?.email === 'nadiachibri@gmail.com' && !isMobile && (
              <>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/admin-customer-support">
                    <Headphones className="w-5 h-5" />
                    <span className="sr-only">Admin Customer Support</span>
                  </Link>
                </Button>
                
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/admin/reports">
                    <Flag className="w-5 h-5" />
                    <span className="sr-only">Admin Reports</span>
                  </Link>
                </Button>
                
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/analytics">
                    <BarChart3 className="w-5 h-5" />
                    <span className="sr-only">Analytics</span>
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile center icons */}
          {isMobile && (
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-12">
              <Link to="/post-item">
                <Plus className="h-6 w-6 text-gray-500" />
              </Link>
              <button onClick={closeAllModals}>
                <ArrowLeftRight className="h-6 w-6 text-gray-500" />
              </button>
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
            
            {/* Profile avatar - always show space, only show avatar when logged in */}
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
                  <DropdownMenuContent align="end" className="w-56 bg-white">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex w-full cursor-pointer items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/trades" className="flex w-full cursor-pointer items-center">
                        <Handshake className="mr-2 h-4 w-4" />
                        <span>Trades</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/your-likes" className="flex w-full cursor-pointer items-center">
                        <Heart className="mr-2 h-4 w-4" />
                        <span>Your Likes</span>
                      </Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                        <Link to="/settings" className="flex w-full cursor-pointer items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                        </DropdownMenuItem>
                        {(user?.name === 'NadiaHibri' || user?.email === 'nadiahsheriff@gmail.com') && (
                        <DropdownMenuItem asChild>
                          <Link to="/admin/reports" className="flex w-full cursor-pointer items-center">
                            <Flag className="mr-2 h-4 w-4" />
                            <span>Admin Reports</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                     {supabaseConfigured && (
                        <DropdownMenuItem 
                          className="flex cursor-pointer items-center text-red-500 focus:text-red-500"
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log Out</span>
                        </DropdownMenuItem>
                      )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            ) : (
              // Show generic profile icon when not logged in - still clickable with dropdown
              isMobile ? (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative h-8 w-8"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex w-full cursor-pointer items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/trades" className="flex w-full cursor-pointer items-center">
                        <Handshake className="mr-2 h-4 w-4" />
                        <span>Trades</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/your-likes" className="flex w-full cursor-pointer items-center">
                        <Heart className="mr-2 h-4 w-4" />
                        <span>Your Likes</span>
                      </Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                        <Link to="/settings" className="flex w-full cursor-pointer items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                        </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="flex cursor-pointer items-center text-red-500 focus:text-red-500"
                        onClick={handleLogin}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log Out</span>
                      </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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