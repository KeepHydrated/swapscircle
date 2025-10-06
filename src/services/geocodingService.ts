// Geocoding service to convert zipcodes to coordinates
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodeResult {
  success: boolean;
  coordinates?: Coordinates;
  error?: string;
}

// Cache for zipcode to coordinates mapping
const geocodeCache = new Map<string, Coordinates>();

/**
 * Convert a zipcode to coordinates using BigDataCloud's free API
 * @param zipcode US zipcode (5 digits or ZIP+4 format)
 * @returns Coordinates or null if geocoding fails
 */
export async function geocodeZipcode(zipcode: string): Promise<GeocodeResult> {
  if (!zipcode || typeof zipcode !== 'string') {
    return { success: false, error: 'Invalid zipcode' };
  }

  const cleanZip = zipcode.trim().split('-')[0]; // Get first 5 digits only
  
  // Check cache first
  if (geocodeCache.has(cleanZip)) {
    return { success: true, coordinates: geocodeCache.get(cleanZip)! };
  }

  try {
    // Use BigDataCloud's free geocoding API
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode?localityName=${cleanZip}&countryCode=US&localityLanguage=en`
    );
    
    if (!response.ok) {
      return { success: false, error: 'Geocoding API request failed' };
    }

    const data = await response.json();
    
    if (data.latitude && data.longitude) {
      const coordinates: Coordinates = {
        lat: data.latitude,
        lng: data.longitude
      };
      
      // Cache the result
      geocodeCache.set(cleanZip, coordinates);
      
      return { success: true, coordinates };
    }
    
    return { success: false, error: 'Coordinates not found for zipcode' };
  } catch (error) {
    console.error('Geocoding error:', error);
    return { success: false, error: 'Network error during geocoding' };
  }
}

/**
 * Get coordinates for a user's profile location
 * Handles both zipcode format and coordinate string format (lat,lng)
 */
export async function getProfileCoordinates(location: string | null): Promise<Coordinates | null> {
  if (!location) return null;

  // Check if it's already in coordinate format (lat,lng)
  const coordParts = location.split(',');
  if (coordParts.length === 2) {
    const lat = parseFloat(coordParts[0].trim());
    const lng = parseFloat(coordParts[1].trim());
    
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }

  // Try to geocode as zipcode
  const result = await geocodeZipcode(location);
  return result.success && result.coordinates ? result.coordinates : null;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in miles
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
