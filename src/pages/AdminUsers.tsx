import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users, Search, Calendar, Settings } from 'lucide-react';
import { format } from 'date-fns';
import UserSettingsModal from '@/components/admin/UserSettingsModal';

interface UserProfile {
  id: string;
  username: string | null;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
}

const AdminUsers: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;

      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('is_active', true);

      const hasAdminRole = userRoles?.some(role => role.role === 'admin' || role.role === 'moderator');
      setIsAdmin(!!hasAdminRole);
    };

    checkAdminStatus();
  }, [user]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || !isAdmin) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, name, email, avatar_url, created_at')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setUsers(data || []);
        setFilteredUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [user, isAdmin]);

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(u => 
      u.username?.toLowerCase().includes(query) ||
      u.name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleUserClick = (userId: string) => {
    navigate(`/other-person-profile?userId=${userId}`);
  };

  const handleViewSettings = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    setSelectedUserId(userId);
    setSettingsModalOpen(true);
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Please log in to access this page.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">You do not have permission to access this page.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-4 md:p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              All Registered Users
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({users.length} total)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by username, name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No users found matching your search.' : 'No users registered yet.'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((userProfile) => (
                  <div
                    key={userProfile.id}
                    onClick={() => handleUserClick(userProfile.id)}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={userProfile.avatar_url || ''} />
                      <AvatarFallback>
                        {(userProfile.username || userProfile.name || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {userProfile.username || userProfile.name || 'Anonymous User'}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {userProfile.email || 'No email'}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleViewSettings(e, userProfile.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(userProfile.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <UserSettingsModal
        userId={selectedUserId}
        open={settingsModalOpen}
        onOpenChange={setSettingsModalOpen}
      />
    </MainLayout>
  );
};

export default AdminUsers;
