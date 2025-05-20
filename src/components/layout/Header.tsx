
import React, { useState } from 'react';
import { Bell, Plus, User, Settings, LogOut, MessageCircle, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MobileMenu } from './MobileMenu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

const Header = () => {
  // State to track if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleLogout = () => {
    setIsLoggedIn(false);
    toast.success('Successfully logged out');
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    toast.success('Successfully logged in');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-trademate-blue">TradeMate</h1>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          {isLoggedIn ? (
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
              
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Link to="/notifications">
                  <Bell className="w-5 h-5" />
                  <span className="sr-only">Notifications</span>
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-purple-100 text-purple-800">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white">
                  <DropdownMenuItem asChild>
                    <Link to="/profile-duplicate" className="flex w-full cursor-pointer items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
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
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button 
              variant="ghost" 
              onClick={handleLogin} 
              size="sm"
              className="flex items-center"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Log In
            </Button>
          )}

          <MobileMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
