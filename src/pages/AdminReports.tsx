import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Clock, CheckCircle, X, Flag, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ReportedItemModal } from '@/components/admin/ReportedItemModal';

interface Report {
  id: string;
  reporter_id: string;
  reporter_username: string;
  type: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
  action_taken: string | null;
}

const AdminReports: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('open');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

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
          .select('id, username')
          .in('id', reporterIds);

        const formattedReports = data?.map(report => ({
          ...report,
          reporter_username: profiles?.find(p => p.id === report.reporter_id)?.username || 'Unknown User'
        })) || [];

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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Open</p>
                  <p className="text-2xl font-bold">{reports.filter(r => r.status === 'open').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{reports.filter(r => r.status === 'in_progress').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold">{reports.filter(r => r.status === 'resolved').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="open">Open Reports</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
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
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(report.status)}
                          <CardTitle className="text-lg">Report #{report.id.slice(0, 8)}</CardTitle>
                          <Badge variant={getStatusColor(report.status) as any}>
                            {report.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Reporter: {report.reporter_username}</span>
                          <span>Type: {report.type}</span>
                          <span>Created: {format(new Date(report.created_at), 'MMM d, yyyy HH:mm')}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Report Details:</h4>
                      <p className="text-muted-foreground bg-muted p-3 rounded">{report.message}</p>
                    </div>
                    
                    {report.action_taken && (
                      <div>
                        <h4 className="font-semibold mb-2">Action Taken:</h4>
                        <p className="text-muted-foreground bg-green-50 p-3 rounded border border-green-200">{report.action_taken}</p>
                      </div>
                    )}

                    {/* View Item Button - show if report contains item information */}
                    {extractItemId(report.action_taken) && (
                      <div className="flex justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewItem(report)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Reported Item
                        </Button>
                      </div>
                    )}

                    {report.status === 'open' && (
                      <div className="flex gap-2">
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
                      </div>
                    )}

                    {report.status === 'in_progress' && (
                      <div className="flex gap-2">
                        <Button 
                          variant="default" 
                          onClick={() => {
                            const action = prompt('What action was taken?');
                            if (action) updateReportStatus(report.id, 'resolved', action);
                          }}
                        >
                          Mark Resolved
                        </Button>
                      </div>
                    )}
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