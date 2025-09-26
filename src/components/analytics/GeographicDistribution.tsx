import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { extractStateFromLocation, extractCountryFromLocation } from '@/utils/locationUtils';

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
  const [countryData, setCountryData] = useState<UserLocationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserLocations = async () => {
      try {
        // Get all users with their location data (state, location/zipcode, country)
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('state, location, city, country')
          .or('state.not.is.null,location.not.is.null,city.not.is.null,country.not.is.null');

        if (error) throw error;

        // Count users by state using the utility function
        const stateCount = profiles?.reduce((acc: Record<string, number>, profile) => {
          const stateName = extractStateFromLocation(profile.location || '', profile.city || '', profile.state || '');
          
          if (stateName) {
            acc[stateName] = (acc[stateName] || 0) + 1;
          }
          return acc;
        }, {}) || {};

        // Count users by country (for non-US locations)
        const countryCount = profiles?.reduce((acc: Record<string, number>, profile) => {
          // Only count as international if not already counted as US state
          const stateName = extractStateFromLocation(profile.location || '', profile.city || '', profile.state || '');
          
          if (!stateName) {
            const countryName = extractCountryFromLocation(profile.location || '', profile.city || '', profile.country || '');
            if (countryName) {
              acc[countryName] = (acc[countryName] || 0) + 1;
            }
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

        const locationData = Object.entries(stateCount)
          .map(([stateName, count], index) => ({
            location: stateName,
            users: count as number,
            color: stateColors[index % stateColors.length]
          }))
          .sort((a, b) => b.users - a.users)
          .slice(0, 6); // Show top 6 states

        const countryLocationData = Object.entries(countryCount)
          .map(([countryName, count], index) => ({
            location: countryName,
            users: count as number,
            color: stateColors[(index + locationData.length) % stateColors.length]
          }))
          .sort((a, b) => b.users - a.users)
          .slice(0, 4); // Show top 4 countries

        setUserLocationData(locationData);
        setCountryData(countryLocationData);
      } catch (error) {
        console.error('Error fetching user locations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserLocations();
  }, []);

  const totalUsers = userLocationData.reduce((sum, location) => sum + location.users, 0) + countryData.reduce((sum, country) => sum + country.users, 0);

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
          Geographic distribution of user activity by state
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {userLocationData.length > 0 ? (
            <>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Top States by Users</h4>
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
              
              {countryData.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Other Countries</h4>
                  <div className="space-y-2">
                    {countryData.map((country, index) => {
                      const percentage = totalUsers > 0 ? ((country.users / totalUsers) * 100).toFixed(0) : '0';
                      return (
                         <div key={country.location} className="flex items-center justify-between text-sm">
                           <div className="flex items-center gap-2">
                             <div 
                               className="w-3 h-3 rounded-full" 
                               style={{ backgroundColor: country.color }}
                             />
                             <span>{country.location}</span>
                           </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{country.users} users</span>
                            <span className="font-medium">{percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{userLocationData.length}</p>
                  <p className="text-xs text-muted-foreground">States</p>
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