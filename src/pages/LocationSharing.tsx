import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2 } from 'lucide-react';
import { formatLocationForSharing } from '@/utils/locationUtils';

interface LocationData {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  altitude: number | null;
  speed: number | null;
  timestamp: number | null;
}

const LocationSharing = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    // Start watching position when component mounts
    startWatchingPosition();
    
    // Clean up the watcher when component unmounts
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const startWatchingPosition = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    // Watch position continuously
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
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
      }
    );
    
    setWatchId(id);
  };

  const getLocation = () => {
    // Clear previous watch
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
    
    // Start watching again
    startWatchingPosition();
  };

  const shareLocation = async () => {
    if (!location.latitude || !location.longitude) {
      toast.error("Location data not available");
      return;
    }

    try {
      // Create a GeolocationPosition-like object from our location state
      const positionData = {
        coords: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy || 0,
          altitude: location.altitude,
          speed: location.speed,
          altitudeAccuracy: null,
          heading: null
        },
        timestamp: location.timestamp || Date.now()
      };

      // Format location data using the existing utility function
      const locationMessage = formatLocationForSharing(positionData as GeolocationPosition);
      
      // Try to share via Web Share API first
      if (navigator.share) {
        await navigator.share({
          title: "Emergency Location",
          text: locationMessage,
        });
        toast.success("Location shared successfully!");
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(locationMessage);
        
        // Show sharing options
        const shareVia = window.confirm(
          "Location copied to clipboard! Share via:\n\n" +
          "- Click OK for WhatsApp\n" +
          "- Click Cancel for SMS"
        );
        
        if (shareVia) {
          // Open WhatsApp
          window.open(`https://wa.me/?text=${encodeURIComponent(locationMessage)}`, "_blank");
        } else {
          // Open SMS
          window.open(`sms:?body=${encodeURIComponent(locationMessage)}`, "_blank");
        }
        toast.success("Location copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing location:", error);
      toast.error("Failed to share location. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hershield">
      <div className="p-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/home')}
          className="bg-white/20 backdrop-blur-sm text-white mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <h1 className="text-3xl font-cursive text-white font-bold">
          Location Sharing
        </h1>
        <p className="text-white/80 mb-6">Share your location with trusted contacts</p>
        
        <div className="bg-white rounded-xl p-6 shadow-lg">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-hershield-red border-t-transparent rounded-full mb-4"></div>
              <p>Getting your location...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button 
                onClick={getLocation}
                className="bg-hershield-red hover:bg-red-700 text-white"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                  {location.latitude && location.longitude ? (
                    <iframe
                      title="Your Location"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${location.latitude},${location.longitude}&zoom=18`}
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-200">
                      <p>Map not available</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Latitude</p>
                      <p className="font-medium">{location.latitude?.toFixed(6) || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Longitude</p>
                      <p className="font-medium">{location.longitude?.toFixed(6) || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Accuracy</p>
                      <p className="font-medium">{location.accuracy ? `${Math.round(location.accuracy)}m` : 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Altitude</p>
                      <p className="font-medium">{location.altitude ? `${Math.round(location.altitude)}m` : 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Speed</p>
                      <p className="font-medium">{location.speed ? `${Math.round(location.speed * 3.6)}km/h` : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={getLocation}
                  variant="outline"
                  className="w-full"
                >
                  Refresh Location
                </Button>
                <Button
                  onClick={shareLocation}
                  className="w-full bg-hershield-red hover:bg-red-700 text-white"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share My Location
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationSharing;
