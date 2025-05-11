
import React from 'react';
import { Bell, Plus, User, Settings, LogOut, MessageCircle, MapPin, Clock, Shield, Calendar } from 'lucide-react';
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
            <Bell className="w-5 h-5" />
            <span className="sr-only">Notifications</span>
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
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">User</p>
                  <p className="text-xs text-muted-foreground">user@example.com</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex w-full cursor-pointer items-center">
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
              <DropdownMenuItem className="flex cursor-pointer items-center text-red-500 focus:text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              
              {/* Profile information section */}
              <div className="p-3">
                <h3 className="text-sm font-semibold mb-2">Emma Wilson</h3>
                
                <div className="flex items-center mb-1.5 text-amber-400">
                  {'★★★★★'} <span className="text-gray-500 text-xs ml-1">(42 reviews)</span>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                    <span>2.3 mi away</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                    <span>Response: ~1 hour</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                    <span>Verified member</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                    <span>Since 2023</span>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <MobileMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
