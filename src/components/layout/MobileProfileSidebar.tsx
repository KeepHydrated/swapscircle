import React, { useState } from 'react';
import { User, Settings, LogOut, Handshake, Flag, Headphones, Heart, ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/context/AuthContext';

interface MobileProfileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MobileProfileSidebar = ({ open, onOpenChange }: MobileProfileSidebarProps) => {
  const { user, signOut, supabaseConfigured } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    onOpenChange(false);
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 bg-white">
        <div className="px-4 py-6">
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start h-12" asChild>
              <Link to="/profile" onClick={() => onOpenChange(false)}>
                <User className="mr-3 h-5 w-5" />
                <span>Profile</span>
              </Link>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start h-12" asChild>
              <Link to="/trades" onClick={() => onOpenChange(false)}>
                <Handshake className="mr-3 h-5 w-5" />
                <span>Trades</span>
              </Link>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start h-12" asChild>
              <Link to="/settings" onClick={() => onOpenChange(false)}>
                <Settings className="mr-3 h-5 w-5" />
                <span>Settings</span>
              </Link>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start h-12" asChild>
              <Link to="/customer-support" onClick={() => onOpenChange(false)}>
                <Headphones className="mr-3 h-5 w-5" />
                <span>Customer Support</span>
              </Link>
            </Button>
            
          </div>
          
          {supabaseConfigured && (
            <>
              <Separator className="my-4" />
              <Button 
                variant="ghost" 
                className="w-full justify-start h-12 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                <span>Log Out</span>
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileProfileSidebar;