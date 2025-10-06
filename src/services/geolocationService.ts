// IP-based geolocation service
export interface LocationData {
  country: string;
  countryCode: string;
  region: string;
  regionCode: string;
  city: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface GeolocationResponse {
  success: boolean;
  data?: LocationData;
  error?: string;
}

export async function detectUserLocation(): Promise<GeolocationResponse> {
  try {
    // Using ip-api.com (free tier allows 1000 requests per month)
    const response = await fetch('http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone');
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        success: true,
        data: {
          country: data.country,
          countryCode: data.countryCode,
          region: data.regionName,
          regionCode: data.region,
          city: data.city,
          zipCode: data.zip,
          latitude: data.lat,
          longitude: data.lon,
          timezone: data.timezone
        }
      };
    } else {
      return {
        success: false,
        error: data.message || 'Location detection failed'
      };
    }
  } catch (error) {
    console.error('Error detecting location:', error);
    return {
      success: false,
      error: 'Network error during location detection'
    };
  }
}

export async function detectAndStoreUserLocation(userId: string, skipIfExists: boolean = true): Promise<boolean> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Check if user already has location data
    if (skipIfExists) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('location, state, city, country')
        .eq('id', userId)
        .single();
      
      if (profile && (profile.location || profile.state || profile.city || profile.country)) {
        return true; // User already has location data
      }
    }
    
    const locationResult = await detectUserLocation();
    
    if (locationResult.success && locationResult.data) {
      const location = locationResult.data;
      
      // Store coordinates in lat,lng format for distance calculations
      const coordinateString = `${location.latitude}, ${location.longitude}`;
      
      // Update user profile with detected location
      const { error } = await supabase
        .from('profiles')
        .update({
          country: location.country,
          state: location.regionCode === 'US' ? location.region : null,
          city: location.city,
          location: coordinateString, // Store as coordinates for distance filtering
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) {
        console.error('Error storing location:', error);
        return false;
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error in detectAndStoreUserLocation:', error);
    return false;
  }
}