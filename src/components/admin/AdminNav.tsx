import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Flag, BarChart3, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';

const adminLinks = [
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/reports', label: 'Reports', icon: Flag },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/admin-customer-support', label: 'Support', icon: Headphones },
];

const AdminNav: React.FC = () => {
  const location = useLocation();

  return (
    <div className="border-b bg-muted/30">
      <div className="container mx-auto max-w-4xl px-4">
        <nav className="flex items-center gap-1 overflow-x-auto py-2">
          {adminLinks.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AdminNav;
