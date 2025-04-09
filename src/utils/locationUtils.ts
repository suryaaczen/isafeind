
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      position => resolve(position),
      error => reject(error),
      { enableHighAccuracy: true }
    );
  });
};

// New function for continuous location tracking
export const startLocationTracking = (
  onLocationUpdate: (position: GeolocationPosition) => void,
  onError: (error: GeolocationPositionError) => void,
  interval = 5000 // 5 seconds by default
): { stopTracking: () => void } => {
  let watchId: number | null = null;
  let intervalId: number | null = null;
  
  // Check if geolocation is supported
  if (!navigator.geolocation) {
    onError({ code: 2, message: "Geolocation is not supported by this browser", PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 });
    return { stopTracking: () => {} };
  }
  
  // Start watching position with high accuracy
  watchId = navigator.geolocation.watchPosition(
    position => {
      onLocationUpdate(position);
    },
    error => {
      onError(error);
    },
    { 
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000
    }
  );
  
  // Also set an interval to actively request the position every few seconds
  // This ensures we get frequent updates even if the device doesn't trigger watchPosition often
  intervalId = window.setInterval(async () => {
    try {
      const position = await getCurrentPosition();
      onLocationUpdate(position);
    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        onError(error);
      }
    }
  }, interval);
  
  // Return a function to stop tracking
  return {
    stopTracking: () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    }
  };
};

// Function to format location data for sharing with trusted contacts
export const formatLocationForSharing = (position: GeolocationPosition): string => {
  const { latitude, longitude, accuracy, altitude, speed } = position.coords;
  
  // Create Google Maps link
  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  
  // Create location message with details
  return `
🚨 LIVE LOCATION UPDATE 🚨
My current location:
📍 ${googleMapsUrl}
📱 Accuracy: ${accuracy ? Math.round(accuracy) + 'm' : 'Unknown'}
🏔️ Altitude: ${altitude ? Math.round(altitude) + 'm' : 'Unknown'}
⚡ Speed: ${speed ? Math.round(speed * 3.6) + 'km/h' : 'Unknown'}
⏰ Time: ${new Date().toLocaleTimeString()}
  `;
};
