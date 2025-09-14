import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// For demo purposes - in a real app, this would come from your analytics data
const mockCountryData = [
  { country: 'United States', coordinates: [-95.7129, 37.0902], visits: 1250, color: '#3b82f6' },
  { country: 'United Kingdom', coordinates: [-3.4360, 55.3781], visits: 890, color: '#10b981' },
  { country: 'Canada', coordinates: [-106.3468, 56.1304], visits: 650, color: '#f59e0b' },
  { country: 'Germany', coordinates: [10.4515, 51.1657], visits: 540, color: '#ef4444' },
  { country: 'France', coordinates: [2.2137, 46.2276], visits: 420, color: '#8b5cf6' },
  { country: 'Australia', coordinates: [133.7751, -25.2744], visits: 380, color: '#ec4899' },
  { country: 'Japan', coordinates: [138.2529, 36.2048], visits: 320, color: '#06b6d4' },
  { country: 'Brazil', coordinates: [-51.9253, -14.2350], visits: 280, color: '#84cc16' },
  { country: 'India', coordinates: [78.9629, 20.5937], visits: 240, color: '#f97316' },
  { country: 'Netherlands', coordinates: [5.2913, 52.1326], visits: 180, color: '#6366f1' }
];

interface GeographicDistributionProps {
  className?: string;
}

const GeographicDistribution: React.FC<GeographicDistributionProps> = ({ className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // You would get this from your Supabase Edge Function secrets
    // For now, we'll use a placeholder - users should add their Mapbox token
    const MAPBOX_TOKEN = 'pk.your_mapbox_token_here';
    
    if (MAPBOX_TOKEN === 'pk.your_mapbox_token_here') {
      // Show fallback when no token is provided
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [20, 20],
      zoom: 1.5,
      projection: 'natural-earth'
    });

    map.current.on('load', () => {
      // Add country data points
      mockCountryData.forEach((country, index) => {
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2">
              <h3 class="font-semibold text-sm">${country.country}</h3>
              <p class="text-xs text-muted-foreground">${country.visits} visits</p>
            </div>
          `);

        const marker = new mapboxgl.Marker({
          color: country.color,
          scale: Math.max(0.5, Math.min(2, country.visits / 500))
        })
          .setLngLat(country.coordinates as [number, number])
          .setPopup(popup)
          .addTo(map.current!);
      });
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Fallback view when Mapbox token is not configured
  const FallbackView = () => (
    <div className="space-y-4">
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">Configure Mapbox token to view interactive map</p>
        <p className="text-xs mt-2">Add MAPBOX_PUBLIC_TOKEN to your Supabase Edge Function secrets</p>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Top Countries by Visits</h4>
        <div className="space-y-2">
          {mockCountryData.slice(0, 5).map((country, index) => (
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
    </div>
  );

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
          <div 
            ref={mapContainer} 
            className="w-full h-64 rounded-lg border bg-muted/50"
            style={{ display: 'pk.your_mapbox_token_here' === 'pk.your_mapbox_token_here' ? 'none' : 'block' }}
          />
          
          {'pk.your_mapbox_token_here' === 'pk.your_mapbox_token_here' && <FallbackView />}
          
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