// ZIP code to state mapping for common US ZIP codes
const zipToStateMap: Record<string, string> = {
  // California
  '90210': 'California',
  '90211': 'California', 
  '90212': 'California',
  '94102': 'California',
  '94103': 'California',
  
  // Texas  
  '78212': 'Texas',
  '75201': 'Texas',
  '77001': 'Texas',
  
  // New York
  '10001': 'New York',
  '10002': 'New York',
  '10003': 'New York',
  
  // New Jersey
  '08638': 'New Jersey',
  '07001': 'New Jersey',
  
  // Washington
  '98101': 'Washington',
  '98102': 'Washington',
  
  // Florida
  '33101': 'Florida',
  '33102': 'Florida',
};

// Coordinate to state mapping for major US cities
const coordinateToStateMap: Array<{ lat: number; lng: number; state: string; tolerance: number }> = [
  { lat: 47.669, lng: -122.301, state: 'Washington', tolerance: 0.1 }, // Seattle
  { lat: 34.052, lng: -118.244, state: 'California', tolerance: 0.1 }, // Los Angeles
  { lat: 37.775, lng: -122.419, state: 'California', tolerance: 0.1 }, // San Francisco
  { lat: 40.758, lng: -73.985, state: 'New York', tolerance: 0.1 }, // New York City
  { lat: 29.760, lng: -95.369, state: 'Texas', tolerance: 0.1 }, // Houston
  { lat: 25.761, lng: -80.191, state: 'Florida', tolerance: 0.1 }, // Miami
];

export function extractStateFromLocation(location: string, city?: string, state?: string): string | null {
  // If state is already provided, use it
  if (state) {
    return state;
  }
  
  // If city is in "City, State" format, extract state
  if (city && city.includes(',')) {
    const statePart = city.split(',').pop()?.trim();
    if (statePart && statePart.length === 2) {
      return getFullStateName(statePart.toUpperCase());
    }
  }
  
  if (!location) {
    return null;
  }
  
  // Check if it's a ZIP code (5 digits optionally followed by -4 digits)
  const zipMatch = location.match(/^(\d{5})(-\d{4})?$/);
  if (zipMatch) {
    const zip = zipMatch[1];
    return zipToStateMap[zip] || null;
  }
  
  // Check if it's coordinates (lat, lng format)
  const coordMatch = location.match(/^([-\d.]+),\s*([-\d.]+)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    
    for (const mapping of coordinateToStateMap) {
      if (Math.abs(lat - mapping.lat) <= mapping.tolerance && 
          Math.abs(lng - mapping.lng) <= mapping.tolerance) {
        return mapping.state;
      }
    }
  }
  
  return null;
}

export function extractCountryFromLocation(location: string, city?: string, country?: string): string | null {
  // If country is already provided, use it
  if (country) {
    return country;
  }
  
  // Check if location looks like coordinates outside US
  const coordMatch = location?.match(/^([-\d.]+),\s*([-\d.]+)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    
    // Check if coordinates are outside US bounds (rough approximation)
    if (lat < 24 || lat > 49 || lng < -125 || lng > -66) {
      // Try to map to known countries (simplified)
      if (lat >= 41 && lat <= 44 && lng >= 12 && lng <= 13) {
        return 'Italy';
      }
      // Add more country mappings as needed
      return 'Other Country';
    }
  }
  
  return null;
}

function getFullStateName(stateCode: string): string {
  const stateNames: Record<string, string> = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
  };
  
  return stateNames[stateCode] || stateCode;
}