
import { useState, useEffect, useRef, useCallback } from 'react';

interface LocationData {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  altitude: number | null;
  speed: number | null;
  timestamp: number | null;
}

export const useLocationTracking = () => {
  const [location, setLocation] = useState<LocationData>({
    latitude: null,
    longitude: null,
    accuracy: null,
    altitude: null,
    speed: null,
    timestamp: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<number | null>(null);

  const updateLocation = useCallback((position: GeolocationPosition) => {
    setLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      speed: position.coords.speed,
      timestamp: position.timestamp
    });
    setLoading(false);
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    setError(`Error getting location: ${error.message}`);
    setLoading(false);
    console.error("Geolocation error:", error);
  }, []);

  const startWatchingPosition = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    // Clear any existing watchers
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
    }

    // Watch position continuously
    const id = navigator.geolocation.watchPosition(
      updateLocation,
      handleError,
      { 
        enableHighAccuracy: false,
        maximumAge: 10000,
        timeout: 8000
      }
    );
    
    watchIdRef.current = id;
    
    // Also get position immediately
    navigator.geolocation.getCurrentPosition(
      updateLocation,
      handleError,
      { 
        enableHighAccuracy: false,
        maximumAge: 10000,
        timeout: 5000
      }
    );
    
    // Set up interval for periodic updates
    const interval = window.setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        updateLocation,
        (error) => {
          console.error("Error getting location in interval:", error.message);
        },
        { 
          enableHighAccuracy: false,
          maximumAge: 10000,
          timeout: 5000
        }
      );
    }, 5000);
    
    intervalIdRef.current = interval;
  }, [updateLocation, handleError]);

  const getLocation = useCallback(() => {
    startWatchingPosition();
  }, [startWatchingPosition]);

  useEffect(() => {
    startWatchingPosition();
    
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [startWatchingPosition]);

  return {
    location,
    loading,
    error,
    getLocation
  };
};

export type { LocationData };
