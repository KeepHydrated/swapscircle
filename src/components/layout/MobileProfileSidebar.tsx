import React from 'react';
import { User, Settings, LogOut, Handshake, Flag, Headphones, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';

const MobileProfileSidebar = () => {
  const { user, signOut, supabaseConfigured } = useAuth();

  const handleLogout = async () => {
    await signOut();
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
    <Sidebar side="right" className="bg-white">
      <SidebarHeader>
        <div className="flex items-center space-x-3 p-4">
          <Avatar className="h-10 w-10">
            {user?.avatar_url ? (
              <AvatarImage src={user.avatar_url} alt={user.name || 'User'} />
            ) : null}
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
              {user?.name ? getInitials(user.name) : <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/profile" className="flex w-full cursor-pointer items-center">
                <User className="mr-3 h-5 w-5" />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/trades" className="flex w-full cursor-pointer items-center">
                <Handshake className="mr-3 h-5 w-5" />
                <span>Trades</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/your-likes" className="flex w-full cursor-pointer items-center">
                <Heart className="mr-3 h-5 w-5" />
                <span>Your Likes</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/settings" className="flex w-full cursor-pointer items-center">
                <Settings className="mr-3 h-5 w-5" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {user?.email === 'nadiachibri@gmail.com' && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/customer-support" className="flex w-full cursor-pointer items-center">
                  <Headphones className="mr-3 h-5 w-5" />
                  <span>Customer Support</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          {(user?.name === 'NadiaHibri' || user?.email === 'nadiahsheriff@gmail.com') && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/admin/reports" className="flex w-full cursor-pointer items-center">
                  <Flag className="mr-3 h-5 w-5" />
                  <span>Admin Reports</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
        
        {supabaseConfigured && (
          <>
            <SidebarSeparator />
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="flex cursor-pointer items-center text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  <span>Log Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

export default MobileProfileSidebar;