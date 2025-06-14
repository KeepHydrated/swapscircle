
import React from 'react';
import { Bell, Home, Menu, PieChart, Plus, Search, Settings, User, Heart } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

export const MobileMenu = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle className="text-left text-2xl font-bold text-trademate-blue">
            TradeMate
          </SheetTitle>
        </SheetHeader>
        <Separator className="my-4" />
        <div className="flex flex-col gap-3 mt-4">
          <Link to="/" className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted">
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link to="/liked" className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted">
            <Heart className="w-5 h-5" />
            <span>Liked Items</span>
          </Link>
          <Link to="/markets" className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted">
            <PieChart className="w-5 h-5" />
            <span>Markets</span>
          </Link>
          <Link to="/search" className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted">
            <Search className="w-5 h-5" />
            <span>Search</span>
          </Link>
          <Link to="/watchlist" className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted">
            <Plus className="w-5 h-5" />
            <span>Watchlist</span>
          </Link>
          <Link to="/notifications" className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </Link>
          <Link to="/settings" className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
          <Link to="/profile" className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted">
            <User className="w-5 h-5" />
            <span>Profile</span>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
};
