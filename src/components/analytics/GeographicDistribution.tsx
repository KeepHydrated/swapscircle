import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface UserLocationData {
  location: string;
  users: number;
  color: string;
}

interface GeographicDistributionProps {
  className?: string;
}

const GeographicDistribution: React.FC<GeographicDistributionProps> = ({ className }) => {
  const [userLocationData, setUserLocationData] = useState<UserLocationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserLocations = async () => {
      try {
        // Get all users with their location data (state, location/zipcode)
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('state, location, city')
          .or('state.not.is.null,location.not.is.null,city.not.is.null');

        if (error) throw error;

        // Count users by state/location
        const locationCount = profiles?.reduce((acc: Record<string, number>, profile) => {
          let locationKey = null;
          
          // Prioritize state, then try to extract state from city, then use location/zipcode
          if (profile.state) {
            locationKey = profile.state;
          } else if (profile.city && profile.city.includes(',')) {
            // Extract state from "City, State" format
            const statePart = profile.city.split(',').pop()?.trim();
            if (statePart && statePart.length === 2) {
              locationKey = statePart.toUpperCase();
            }
          } else if (profile.location) {
            // For zipcode, we'll need to map it to state - for now show as "ZIP: xxxxx"
            locationKey = `ZIP: ${profile.location}`;
          }
          
          if (locationKey) {
            acc[locationKey] = (acc[locationKey] || 0) + 1;
          }
          return acc;
        }, {}) || {};

        // Convert to array and sort
        const stateColors = [
          '#3b82f6', // blue
          '#10b981', // green 
          '#f59e0b', // orange
          '#8b5cf6', // purple
          '#ef4444', // red
          '#ec4899', // pink
          '#06b6d4', // cyan
          '#84cc16', // lime
          '#f97316', // orange
          '#6366f1'  // indigo
        ];

        const locationData = Object.entries(locationCount)
          .map(([locationKey, count], index) => ({
            location: locationKey,
            users: count as number,
            color: stateColors[index % stateColors.length]
          }))
          .sort((a, b) => b.users - a.users)
          .slice(0, 6); // Show top 6 states

        setUserLocationData(locationData);
      } catch (error) {
        console.error('Error fetching user locations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserLocations();
  }, []);

  const totalUsers = userLocationData.reduce((sum, location) => sum + location.users, 0);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>User Locations</CardTitle>
          <p className="text-sm text-muted-foreground">
            Geographic distribution of user activity by state
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>User Locations</CardTitle>
        <p className="text-sm text-muted-foreground">
          Geographic distribution of user activity by location
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {userLocationData.length > 0 ? (
            <>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Top Locations by Users</h4>
                <div className="space-y-2">
                  {userLocationData.map((location, index) => {
                    const percentage = totalUsers > 0 ? ((location.users / totalUsers) * 100).toFixed(0) : '0';
                    return (
                       <div key={location.location} className="flex items-center justify-between text-sm">
                         <div className="flex items-center gap-2">
                           <div 
                             className="w-3 h-3 rounded-full" 
                             style={{ backgroundColor: location.color }}
                           />
                           <span>{location.location}</span>
                         </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{location.users} users</span>
                          <span className="font-medium">{percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{userLocationData.length}</p>
                  <p className="text-xs text-muted-foreground">Locations</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">
                    {totalUsers.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-8">
              No user location data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GeographicDistribution;