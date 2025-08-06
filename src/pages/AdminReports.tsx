import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle, Clock, CheckCircle, X, Flag, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ReportedItemModal } from '@/components/admin/ReportedItemModal';

interface Report {
  id: string;
  reporter_id: string;
  reporter_username: string;
  reporter_avatar_url?: string;
  reporter_name?: string;
  type: string;
  message: string;
  displayType?: string; // Parsed report type for display
  displayMessage?: string; // Parsed message for display
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
  action_taken: string | null;
  // Item owner info
  item_owner_id?: string;
  item_owner_username?: string;
  item_owner_avatar_url?: string;
  item_owner_name?: string;
  item_name?: string;
  item_description?: string;
  item_image_url?: string;
  item_image_urls?: string[];
}

const AdminReports: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('open');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  // Handle navigation to user profile
  const handleProfileClick = async (reporterId: string) => {
    // Get current user ID to check if this is their own profile
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const currentUserId = currentUser?.id;
    
    if (currentUserId === reporterId) {
      // It's their own profile - navigate to regular profile page
      navigate('/profile');
    } else {
      // It's someone else's profile - navigate to other person profile
      navigate(`/other-profile/${reporterId}`);
    }
  };

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

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      if (!user || !isAdmin) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('reports')
          .select(`
            id,
            reporter_id,
            type,
            message,
            status,
            created_at,
            updated_at,
            action_taken
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Get reporter usernames separately
        const reporterIds = [...new Set(data?.map(r => r.reporter_id) || [])];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, name')
          .in('id', reporterIds);

        // Get item IDs and fetch item details with owner info
        const itemIds = data?.map(r => extractItemId(r.action_taken)).filter(Boolean) || [];
        let itemsData: any[] = [];
        let itemOwnerProfiles: any[] = [];
        
        if (itemIds.length > 0) {
          const { data: items } = await supabase
            .from('items')
            .select('id, name, description, user_id, image_url, image_urls')
            .in('id', itemIds);
          
          itemsData = items || [];
          
          // Get item owner profiles
          const ownerIds = [...new Set(itemsData.map(item => item.user_id))];
          if (ownerIds.length > 0) {
            const { data: ownerProfiles } = await supabase
              .from('profiles')
              .select('id, username, avatar_url, name')
              .in('id', ownerIds);
            
            itemOwnerProfiles = ownerProfiles || [];
          }
        }

        const formattedReports = data?.map(report => {
          const profile = profiles?.find(p => p.id === report.reporter_id);
          
          // Parse the message to extract actual report type and description
          let displayType: string = report.type;
          let displayMessage: string = report.message;
          
          // Check if message follows format "Item Report - [type]: [description]"
          const messageMatch = report.message.match(/^Item Report - ([^:]+): (.+)$/);
          if (messageMatch) {
            displayType = messageMatch[1];
            displayMessage = messageMatch[2];
          }
          
          // Get item and owner info
          const itemId = extractItemId(report.action_taken);
          const item = itemsData.find(i => i.id === itemId);
          const itemOwner = item ? itemOwnerProfiles.find(p => p.id === item.user_id) : null;
          
          return {
            ...report,
            // Keep original type for database operations, add display fields
            displayType,
            displayMessage,
            reporter_username: profile?.username || 'Unknown User',
            reporter_avatar_url: profile?.avatar_url,
            reporter_name: profile?.name,
            // Item owner info
            item_owner_id: itemOwner?.id,
            item_owner_username: itemOwner?.username,
             item_owner_avatar_url: itemOwner?.avatar_url,
             item_owner_name: itemOwner?.name,
             item_name: item?.name,
             item_description: item?.description,
             item_image_url: item?.image_url,
             item_image_urls: item?.image_urls
          };
        }) || [];

        setReports(formattedReports);
      } catch (error) {
        console.error('Error fetching reports:', error);
        toast.error('Failed to load reports');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [user, isAdmin]);

  const updateReportStatus = async (reportId: string, newStatus: Report['status'], actionTaken?: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: newStatus,
          action_taken: actionTaken || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: newStatus, action_taken: actionTaken || null }
          : report
      ));

      toast.success('Report status updated');
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Failed to update report status');
    }
  };

  const getStatusIcon = (status: Report['status']) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in_progress': return 'default';
      case 'resolved': return 'secondary';
      default: return 'default';
    }
  };

  // Extract item ID from action_taken field
  const extractItemId = (actionTaken: string | null): string | null => {
    if (!actionTaken) return null;
    
    // Look for pattern "ID: [uuid]"
    const idMatch = actionTaken.match(/ID:\s*([a-f0-9-]{36})/i);
    return idMatch ? idMatch[1] : null;
  };

  // Handle viewing reported item
  const handleViewItem = (report: Report) => {
    const itemId = extractItemId(report.action_taken);
    if (itemId) {
      setSelectedItemId(itemId);
      setIsItemModalOpen(true);
    } else {
      toast.error('Item ID not found in report');
    }
  };

  // Handle deleting a report
  const handleDeleteReport = async (reportId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this report? This action cannot be undone.');
    
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      setReports(prev => prev.filter(report => report.id !== reportId));
      toast.success('Report deleted successfully');
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    }
  };

  const filteredReports = reports.filter(report => report.status === activeTab);

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p>Please log in to access this page.</p>
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <Flag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to view this page.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Flag className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Reports Management</h1>
            <p className="text-muted-foreground">Review and manage user reports</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="open">Open Reports ({reports.filter(r => r.status === 'open').length})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({reports.filter(r => r.status === 'in_progress').length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({reports.filter(r => r.status === 'resolved').length})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredReports.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Flag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No {activeTab} reports</h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'open' ? 'No reports need your attention right now.' : `No reports with ${activeTab.replace('_', ' ')} status.`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredReports.map((report) => (
                <Card key={report.id}>
                   <CardHeader>
                     <div className="flex items-start gap-8">
                       {/* Date and Report Details on the left */}
                       <div>
                         <div className="text-xs text-muted-foreground mb-3">
                           {format(new Date(report.created_at), "MMM d, yyyy HH:mm")}
                         </div>
                         
                         {/* Report Details */}
                         <div>
                           <div className="space-y-2">
                              <div className="font-medium text-sm text-gray-700 capitalize">
                                {(report.displayType || report.type).replace(/_/g, ' ')}
                              </div>
                              <p className="text-sm text-muted-foreground">{report.displayMessage || report.message}</p>
                           </div>
                         </div>
                       </div>
                        
                        {/* Profiles column in the middle */}
                        <div className="flex flex-col items-center gap-4">
                          {/* Reporter Profile */}
                          <div 
                            className="flex gap-3 items-center cursor-pointer hover:opacity-80 transition-opacity bg-gray-50 p-3 rounded-lg border border-gray-200 w-80"
                            onClick={() => handleProfileClick(report.reporter_id)}
                          >
                            <div className="w-11 h-11 rounded-full border cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center bg-primary text-primary-foreground font-semibold text-sm flex-shrink-0">
                              {report.reporter_avatar_url ? (
                                <img
                                  src={report.reporter_avatar_url}
                                  alt={report.reporter_name || report.reporter_username}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span>
                                  {(report.reporter_username || "U").substring(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 hover:text-primary transition-colors cursor-pointer truncate">
                                  {report.reporter_name || report.reporter_username || "Unknown User"}
                                </span>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <span className="text-yellow-500">★</span>
                                  <span className="text-sm text-gray-600">No reviews</span>
                                </div>
                              </div>
                               <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                 <span>Reporter • Since 2024</span>
                               </div>
                            </div>
                          </div>

                          {/* Item Owner Profile */}
                          {report.item_owner_id && (
                            <div 
                              className="flex gap-3 items-center cursor-pointer hover:opacity-80 transition-opacity bg-blue-50 p-3 rounded-lg border border-blue-200 w-80"
                              onClick={() => handleProfileClick(report.item_owner_id!)}
                            >
                              <div className="w-11 h-11 rounded-full border cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center bg-blue-600 text-white font-semibold text-sm flex-shrink-0">
                                {report.item_owner_avatar_url ? (
                                  <img
                                    src={report.item_owner_avatar_url}
                                    alt={report.item_owner_name || report.item_owner_username}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <span>
                                    {(report.item_owner_username || "U").substring(0, 2).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-900 hover:text-primary transition-colors cursor-pointer truncate">
                                    {report.item_owner_name || report.item_owner_username || "Unknown User"}
                                  </span>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <span className="text-yellow-500">★</span>
                                    <span className="text-sm text-gray-600">No reviews</span>
                                  </div>
                                </div>
                                 <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                   <span>Item Owner • Since 2024</span>
                                 </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Item display column on the right */}
                        {extractItemId(report.action_taken) && (
                          <div className="bg-white border border-gray-200 rounded-lg p-4 w-96">
                            <div className="space-y-3">
                               {/* Item Image and Details Grid */}
                               <div className="flex gap-4">
                                 {/* Item Image(s) on the left */}
                                 <div className="flex-shrink-0">
                                   {(report.item_image_url || (report.item_image_urls && report.item_image_urls.length > 0)) ? (
                                     <div className="w-32 h-32 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                                       <img
                                         src={report.item_image_url || report.item_image_urls?.[0]}
                                         alt={report.item_name || "Item"}
                                         className="w-full h-full object-cover"
                                         onError={(e) => {
                                           const target = e.target as HTMLImageElement;
                                           target.style.display = 'none';
                                           const parent = target.parentElement;
                                           if (parent) {
                                             parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>';
                                           }
                                         }}
                                       />
                                     </div>
                                   ) : (
                                     <div className="w-32 h-32 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                                       <span className="text-gray-400 text-xs text-center">No Image</span>
                                     </div>
                                   )}
                                 </div>
                                 
                                  {/* Item Details on the right */}
                                  <div className="flex-1 space-y-3">
                                    {/* Item Name and Description */}
                                    {report.item_name && (
                                      <div>
                                        <div className="text-lg font-semibold text-gray-900 truncate">
                                          {report.item_name}
                                        </div>
                                        {report.item_description && (
                                          <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                                            {report.item_description}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    
                                    {/* Item Details */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div className="font-medium text-gray-900">Electronics</div>
                                      <div className="font-medium text-gray-900">Cameras</div>
                                      <div className="font-medium text-gray-900">Brand New</div>
                                      <div className="font-medium text-gray-900">Up to $50</div>
                                    </div>
                                   </div>
                                 </div>
                             </div>
                           </div>
                         )}
                     </div>
                  </CardHeader>
                   <CardContent className="space-y-4">
                     {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {report.status === 'open' && (
                          <>
                            <Button 
                              variant="outline" 
                              onClick={() => updateReportStatus(report.id, 'in_progress')}
                            >
                              Mark In Progress
                            </Button>
                            <Button 
                              variant="default" 
                              onClick={() => {
                                const action = prompt('What action was taken?');
                                if (action) updateReportStatus(report.id, 'resolved', action);
                              }}
                            >
                              Mark Resolved
                            </Button>
                          </>
                        )}

                        {report.status === 'in_progress' && (
                          <Button 
                            variant="default" 
                            onClick={() => {
                              const action = prompt('What action was taken?');
                              if (action) updateReportStatus(report.id, 'resolved', action);
                            }}
                          >
                            Mark Resolved
                          </Button>
                        )}
                      </div>

                      {/* Delete Button */}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteReport(report.id)}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Reported Item Modal */}
        <ReportedItemModal
          isOpen={isItemModalOpen}
          onClose={() => {
            setIsItemModalOpen(false);
            setSelectedItemId(null);
          }}
          itemId={selectedItemId}
        />
      </div>
    </MainLayout>
  );
};

export default AdminReports;