
import { useState, useEffect } from 'react';

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
  const [watchId, setWatchId] = useState<number | null>(null);
  const [intervalId, setIntervalId] = useState<number | null>(null);

  const startWatchingPosition = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    // Watch position continuously with less demanding options
    const id = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          speed: position.coords.speed,
          timestamp: position.timestamp
        });
        setLoading(false);
      },
      (error) => {
        setError(`Error getting location: ${error.message}`);
        setLoading(false);
      },
      { 
        enableHighAccuracy: false,  // Set to false for faster response
        maximumAge: 10000,  // Accept positions up to 10 seconds old
        timeout: 8000  // Increase timeout to 8 seconds
      }
    );
    
    setWatchId(id);
    
    // Update less frequently and with more permissive options
    const interval = window.setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            speed: position.coords.speed,
            timestamp: position.timestamp
          });
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location in interval:", error.message);
          // Don't set error state here to avoid overriding the watchPosition
        },
        { 
          enableHighAccuracy: false,  // Set to false for faster response
          maximumAge: 10000,  // Accept positions up to 10 seconds old
          timeout: 5000  // Shorter timeout for interval updates
        }
      );
    }, 2000); // 2 seconds interval for more responsive updates
    
    setIntervalId(interval);
  };

  const getLocation = () => {
    // Clear previous watch and interval
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
    
    if (intervalId !== null) {
      clearInterval(intervalId);
    }
    
    // Start watching again
    startWatchingPosition();
  };

  useEffect(() => {
    // Start watching position when component mounts
    startWatchingPosition();
    
    // Clean up the watcher when component unmounts
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return {
    location,
    loading,
    error,
    getLocation
  };
};

export type { LocationData };
