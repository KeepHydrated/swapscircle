
import React from 'react';
import { Bell, Plus, User, Settings, LogOut, MessageCircle } from 'lucide-react';
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

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-trademate-blue">TradeMate</h1>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
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
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/other-person-profile" className="flex w-full cursor-pointer items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Other Person's Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex w-full cursor-pointer items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex cursor-pointer items-center text-red-500 focus:text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <MobileMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
