
import React from 'react';
import { Bell, Plus, User, Settings, LogOut, MessageCircle, LogIn, AlertTriangle, Handshake } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import HeaderLocationSelector from './HeaderLocationSelector';
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
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';

const Header = () => {
  const { user, signOut, supabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const unreadCount = useUnreadNotifications();

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

  const handleNotificationsClick = () => {
    navigate('/notifications');
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
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-trademate-blue">TradeMate</h1>
          </Link>
        </div>

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

          {(user || !supabaseConfigured) ? (
            <>
              
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
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden md:flex relative"
                onClick={handleNotificationsClick}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
              
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
                    <Link to="/settings" className="flex w-full cursor-pointer items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
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
            </>
          ) : !isAuthPage ? (
            <Button 
              variant="ghost" 
              onClick={handleLogin} 
              size="sm"
              className="flex items-center"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Log In
            </Button>
          ) : null}

          
        </div>
      </div>
    </header>
  );
};

export default Header;
