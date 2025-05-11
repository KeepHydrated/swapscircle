
import React from 'react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Home, PieChart, Search, Settings, User } from 'lucide-react';

interface SideNavProps {
  className?: string;
}

export const SideNav: React.FC<SideNavProps> = ({ className }) => {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: PieChart, label: 'Markets', path: '/markets' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className={cn("w-64 border-r bg-background", className)}>
      <div className="space-y-2 py-4">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 mx-2 rounded-md text-sm font-medium transition-colors",
                isActive ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
