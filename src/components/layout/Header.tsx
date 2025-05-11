
import React from 'react';
import { Bell, Plus, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MobileMenu } from './MobileMenu';

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
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Plus className="w-5 h-5" />
            <span className="sr-only">Add New</span>
          </Button>
          
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Bell className="w-5 h-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5" />
            <span className="sr-only">Account</span>
          </Button>

          <MobileMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
