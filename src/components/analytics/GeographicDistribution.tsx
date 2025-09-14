import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// For demo purposes - in a real app, this would come from your analytics data
const mockCountryData = [
  { country: 'United States', visits: 1250, color: '#3b82f6' },
  { country: 'United Kingdom', visits: 890, color: '#10b981' },
  { country: 'Canada', visits: 650, color: '#f59e0b' },
  { country: 'Germany', visits: 540, color: '#ef4444' },
  { country: 'France', visits: 420, color: '#8b5cf6' },
  { country: 'Australia', visits: 380, color: '#ec4899' },
  { country: 'Japan', visits: 320, color: '#06b6d4' },
  { country: 'Brazil', visits: 280, color: '#84cc16' },
  { country: 'India', visits: 240, color: '#f97316' },
  { country: 'Netherlands', visits: 180, color: '#6366f1' }
];

interface GeographicDistributionProps {
  className?: string;
}

const GeographicDistribution: React.FC<GeographicDistributionProps> = ({ className }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Geographic Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">
          Where your users are visiting from around the world
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Top Countries by Visits</h4>
            <div className="space-y-2">
              {mockCountryData.map((country, index) => (
                <div key={country.country} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: country.color }}
                    />
                    <span>{country.country}</span>
                  </div>
                  <span className="font-medium">{country.visits}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <p className="text-2xl font-bold">{mockCountryData.length}</p>
              <p className="text-xs text-muted-foreground">Countries</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">
                {mockCountryData.reduce((sum, country) => sum + country.visits, 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Total Visits</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeographicDistribution;