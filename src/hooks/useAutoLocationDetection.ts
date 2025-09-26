import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { detectAndStoreUserLocation } from '@/services/geolocationService';

export function useAutoLocationDetection() {
  const { user } = useAuth();
  const [hasDetected, setHasDetected] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    const detectLocation = async () => {
      if (!user?.id || hasDetected || isDetecting) return;
      
      setIsDetecting(true);
      
      try {
        // Check if we've already tried to detect location for this session
        const sessionKey = `location_detected_${user.id}`;
        if (sessionStorage.getItem(sessionKey)) {
          setHasDetected(true);
          return;
        }
        
        // Detect and store location (skip if user already has location data)
        const success = await detectAndStoreUserLocation(user.id, true);
        
        if (success) {
          // Mark as detected for this session
          sessionStorage.setItem(sessionKey, 'true');
          setHasDetected(true);
        }
      } catch (error) {
        console.error('Auto location detection failed:', error);
      } finally {
        setIsDetecting(false);
      }
    };

    // Small delay to avoid blocking initial page load
    const timer = setTimeout(detectLocation, 2000);
    
    return () => clearTimeout(timer);
  }, [user?.id, hasDetected, isDetecting]);

  return { hasDetected, isDetecting };
}