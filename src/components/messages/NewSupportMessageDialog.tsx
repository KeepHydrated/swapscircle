import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { createOrFindSupportConversation } from '@/services/supportConversationService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface UserResult {
  id: string;
  username: string | null;
  name: string | null;
  avatar_url: string | null;
}

const NewSupportMessageDialog = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open || search.length < 2) {
      setUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('id, username, name, avatar_url')
        .or(`username.ilike.%${search}%,name.ilike.%${search}%`)
        .limit(10);
      setUsers(data || []);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, open]);

  const handleSelectUser = async (userId: string) => {
    const conversationId = await createOrFindSupportConversation(userId);
    if (conversationId) {
      setOpen(false);
      navigate(`/messages?conversation=${conversationId}`);
    } else {
      toast.error('Failed to create support conversation');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Support Message
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Message a User as Support</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by username or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="max-h-60 overflow-y-auto space-y-1">
          {loading && <p className="text-sm text-muted-foreground text-center py-4">Searching...</p>}
          {!loading && search.length >= 2 && users.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
          )}
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"
              onClick={() => handleSelectUser(u.id)}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={u.avatar_url || undefined} />
                <AvatarFallback>{(u.username || u.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{u.username || u.name || 'Unknown'}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewSupportMessageDialog;
