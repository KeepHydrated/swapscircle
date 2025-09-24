import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, User, Package } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import GeographicDistribution from '@/components/analytics/GeographicDistribution';

const Analytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalItems: 0,
    activeTrades: 0,
    completedTrades: 0,
    pageViews: {
      today: 0,
      yesterday: 0,
      thisWeek: 0,
      lastWeek: 0,
      thisMonth: 0,
      lastMonth: 0,
      total: 0
    },
    trafficSources: [] as Array<{ source: string; visits: number; percentage: number }>,
    userGrowthData: [] as Array<{ month: string; users: number }>,
    itemsData: [] as Array<{ category: string; count: number }>,
    tradesData: [] as Array<{ month: string; trades: number }>,
    recentUsers: [] as Array<{ id: string; username: string; avatar_url: string | null; created_at: string }>,
    recentItems: [] as Array<{ id: string; name: string; image_url: string | null; created_at: string; owner_username: string }>
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        // Fetch total users (from profiles table)
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch total items
        const { count: totalItems } = await supabase
          .from('items')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published');

        // Fetch active trades (pending status)
        const { count: activeTrades } = await supabase
          .from('trades')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Fetch completed trades
        const { count: completedTrades } = await supabase
          .from('trades')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed');

        // Fetch user growth data (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const { data: userGrowthRaw } = await supabase
          .from('profiles')
          .select('created_at')
          .gte('created_at', sixMonthsAgo.toISOString());

        // Process user growth data
        const userGrowthData = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthName = date.toLocaleDateString('en', { month: 'short' });
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          
          const usersInMonth = userGrowthRaw?.filter(user => {
            const createdAt = new Date(user.created_at);
            return createdAt >= monthStart && createdAt <= monthEnd;
          }).length || 0;
          
          userGrowthData.push({ month: monthName, users: usersInMonth });
        }

        // Fetch items by category
        const { data: itemsRaw } = await supabase
          .from('items')
          .select('category')
          .eq('status', 'published');

        const categoryCount = itemsRaw?.reduce((acc: Record<string, number>, item) => {
          const category = item.category || 'Other';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {}) || {};

        const itemsData = Object.entries(categoryCount)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Fetch trades data (last 6 months)
        const { data: tradesRaw } = await supabase
          .from('trades')
          .select('created_at, status')
          .gte('created_at', sixMonthsAgo.toISOString());

        // Process trades data
        const tradesData = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthName = date.toLocaleDateString('en', { month: 'short' });
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          
          const tradesInMonth = tradesRaw?.filter(trade => {
            const createdAt = new Date(trade.created_at);
            return createdAt >= monthStart && createdAt <= monthEnd;
          }).length || 0;
          
          tradesData.push({ month: monthName, trades: tradesInMonth });
        }

        // Fetch page view metrics
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay()); // Start of this week (Sunday)
        
        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        const lastWeekEnd = new Date(thisWeekStart);
        lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
        
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // Get page view counts for different periods
        const [
          { count: totalPageViews },
          { count: todayViews },
          { count: yesterdayViews },
          { count: thisWeekViews },
          { count: lastWeekViews },
          { count: thisMonthViews },
          { count: lastMonthViews }
        ] = await Promise.all([
          supabase.from('page_views').select('*', { count: 'exact', head: true }),
          supabase.from('page_views').select('*', { count: 'exact', head: true })
            .gte('created_at', today.toISOString()),
          supabase.from('page_views').select('*', { count: 'exact', head: true })
            .gte('created_at', yesterday.toISOString())
            .lt('created_at', today.toISOString()),
          supabase.from('page_views').select('*', { count: 'exact', head: true })
            .gte('created_at', thisWeekStart.toISOString()),
          supabase.from('page_views').select('*', { count: 'exact', head: true })
            .gte('created_at', lastWeekStart.toISOString())
            .lt('created_at', thisWeekStart.toISOString()),
          supabase.from('page_views').select('*', { count: 'exact', head: true })
            .gte('created_at', thisMonthStart.toISOString()),
          supabase.from('page_views').select('*', { count: 'exact', head: true })
            .gte('created_at', lastMonthStart.toISOString())
            .lt('created_at', thisMonthStart.toISOString())
        ]);

        // Fetch recent users (last 10)
        const { data: recentUsersData } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, created_at')
          .order('created_at', { ascending: false })
          .limit(10);

        // Fetch recent items (last 10) with owner info
        const { data: recentItemsData } = await supabase
          .from('items')
          .select(`
            id, 
            name, 
            image_url, 
            created_at,
            user_id,
            profiles!inner(username)
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(10);

        // Fetch traffic sources data
        const { data: trafficSourcesRaw } = await supabase
          .from('page_views')
          .select('referrer');

        // Process traffic sources
        const referrerCount = trafficSourcesRaw?.reduce((acc: Record<string, number>, view) => {
          let source = 'Direct';
          
          if (view.referrer) {
            const referrer = view.referrer.toLowerCase();
            if (referrer.includes('google')) {
              source = 'Google Search';
            } else if (referrer.includes('facebook')) {
              source = 'Facebook';
            } else if (referrer.includes('twitter') || referrer.includes('t.co')) {
              source = 'Twitter';
            } else if (referrer.includes('instagram')) {
              source = 'Instagram';
            } else if (referrer.includes('linkedin')) {
              source = 'LinkedIn';
            } else if (referrer.includes('youtube')) {
              source = 'YouTube';
            } else if (referrer.includes('reddit')) {
              source = 'Reddit';
            } else {
              source = 'Other Websites';
            }
          }
          
          acc[source] = (acc[source] || 0) + 1;
          return acc;
        }, {}) || {};

        const totalTrafficViews = Object.values(referrerCount).reduce((sum: number, count) => sum + (count as number), 0);
        const trafficSources = Object.entries(referrerCount)
          .map(([source, visits]) => ({
            source,
            visits: visits as number,
            percentage: totalTrafficViews > 0 ? Math.round(((visits as number) / totalTrafficViews) * 100) : 0
          }))
          .sort((a, b) => b.visits - a.visits);

        setAnalytics({
          totalUsers: totalUsers || 0,
          totalItems: totalItems || 0,
          activeTrades: activeTrades || 0,
          completedTrades: completedTrades || 0,
          pageViews: {
            today: todayViews || 0,
            yesterday: yesterdayViews || 0,
            thisWeek: thisWeekViews || 0,
            lastWeek: lastWeekViews || 0,
            thisMonth: thisMonthViews || 0,
            lastMonth: lastMonthViews || 0,
            total: totalPageViews || 0
          },
          trafficSources,
          userGrowthData,
          itemsData,
          tradesData,
          recentUsers: recentUsersData?.map(user => ({
            id: user.id,
            username: user.username || 'User',
            avatar_url: user.avatar_url,
            created_at: user.created_at
          })) || [],
          recentItems: recentItemsData?.map(item => ({
            id: item.id,
            name: item.name,
            image_url: item.image_url,
            created_at: item.created_at,
            owner_username: (item.profiles as any)?.username || 'Unknown'
          })) || []
        });

      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleUserClick = (userId: string) => {
    navigate(`/other-person-profile?userId=${userId}`);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of platform metrics and user activity
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Registered users
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalItems}</div>
              <p className="text-xs text-muted-foreground">
                Published items
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeTrades}</div>
              <p className="text-xs text-muted-foreground">
                Pending trades
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.completedTrades}</div>
              <p className="text-xs text-muted-foreground">
                Successful trades
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recently Joined Users - Full Width Row */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Recently Joined Users
            </CardTitle>
            <CardDescription>
              Latest users who signed up to the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent users</p>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {analytics.recentUsers.map((user) => (
                  <div 
                    key={user.id} 
                    className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors min-w-[100px]"
                    onClick={() => handleUserClick(user.id)}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar_url || ''} alt={user.username} />
                      <AvatarFallback className="text-lg">
                        {user.username.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <p className="text-sm font-medium truncate max-w-[80px]">{user.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recently Added Items - Full Width Row */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recently Added Items
            </CardTitle>
            <CardDescription>
              Latest items posted for trade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent items</p>
              ) : (
                analytics.recentItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        by {item.owner_username} • {new Date(item.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Page Views Section */}
        <Card>
          <CardHeader>
            <CardTitle>Page Views</CardTitle>
            <CardDescription>
              Track visitor engagement across different time periods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Today</p>
                <p className="text-2xl font-bold">{analytics.pageViews.today}</p>
                <p className="text-xs text-muted-foreground">
                  vs {analytics.pageViews.yesterday} yesterday
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">This Week</p>
                <p className="text-2xl font-bold">{analytics.pageViews.thisWeek}</p>
                <p className="text-xs text-muted-foreground">
                  vs {analytics.pageViews.lastWeek} last week
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">This Month</p>
                <p className="text-2xl font-bold">{analytics.pageViews.thisMonth}</p>
                <p className="text-xs text-muted-foreground">
                  vs {analytics.pageViews.lastMonth} last month
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Total Views</p>
                <p className="text-2xl font-bold">{analytics.pageViews.total}</p>
                <p className="text-xs text-muted-foreground">
                  All time page views
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>
              Where your users are coming from
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.trafficSources.length === 0 ? (
                <p className="text-sm text-muted-foreground">No traffic data available</p>
              ) : (
                analytics.trafficSources.map((source) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary" 
                           style={{ backgroundColor: `hsl(${source.source === 'Direct' ? '142' : source.source === 'Google Search' ? '27' : source.source === 'Facebook' ? '221' : source.source === 'Twitter' ? '197' : source.source === 'Instagram' ? '300' : source.source === 'LinkedIn' ? '201' : source.source === 'YouTube' ? '0' : '280'}, 70%, 50%)` }} />
                      <div>
                        <p className="text-sm font-medium">{source.source}</p>
                        <p className="text-xs text-muted-foreground">{source.visits} visits</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{source.percentage}%</p>
                      <div className="w-16 h-2 bg-muted rounded-full mt-1">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ 
                            width: `${source.percentage}%`,
                            backgroundColor: `hsl(${source.source === 'Direct' ? '142' : source.source === 'Google Search' ? '27' : source.source === 'Facebook' ? '221' : source.source === 'Twitter' ? '197' : source.source === 'Instagram' ? '300' : source.source === 'LinkedIn' ? '201' : source.source === 'YouTube' ? '0' : '280'}, 70%, 50%)`
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <div className="grid gap-4 md:grid-cols-2">
          <GeographicDistribution />
          <Card>
            <CardHeader>
              <CardTitle>User Locations</CardTitle>
              <CardDescription>
                Geographic distribution of user activity by state
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-sm font-medium">California</p>
                      <p className="text-xs text-muted-foreground">324 users</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">28%</p>
                    <div className="w-16 h-2 bg-muted rounded-full mt-1">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '28%' }} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div>
                      <p className="text-sm font-medium">New York</p>
                      <p className="text-xs text-muted-foreground">256 users</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">22%</p>
                    <div className="w-16 h-2 bg-muted rounded-full mt-1">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '22%' }} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <div>
                      <p className="text-sm font-medium">Texas</p>
                      <p className="text-xs text-muted-foreground">189 users</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">16%</p>
                    <div className="w-16 h-2 bg-muted rounded-full mt-1">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: '16%' }} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <div>
                      <p className="text-sm font-medium">Florida</p>
                      <p className="text-xs text-muted-foreground">134 users</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">12%</p>
                    <div className="w-16 h-2 bg-muted rounded-full mt-1">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: '12%' }} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div>
                      <p className="text-sm font-medium">Other States</p>
                      <p className="text-xs text-muted-foreground">97 users</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">8%</p>
                    <div className="w-16 h-2 bg-muted rounded-full mt-1">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: '8%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>
                Monthly user registration growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items by Category</CardTitle>
              <CardDescription>
                Distribution of posted items by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.itemsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Trades</CardTitle>
            <CardDescription>
              Number of successful trades completed each month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.tradesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="trades" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Analytics;