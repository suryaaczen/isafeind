
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import LocationDetails from '@/components/location/LocationDetails';
import LocationSharingActions from '@/components/location/LocationSharingActions';
import LocationLoadingState from '@/components/location/LocationLoadingState';
import { useState, useEffect, useCallback, useRef } from 'react';
import TrustedContactsModal from '@/components/TrustedContactsModal';

const LocationSharing = () => {
  const navigate = useNavigate();
  const { location, loading, error, getLocation } = useLocationTracking();
  const [showContactsModal, setShowContactsModal] = useState(false);
  const locationUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Create a memoized version of getLocation to prevent infinite re-renders
  const fetchLocation = useCallback(() => {
    getLocation();
  }, [getLocation]);
  
  // Refresh location immediately on component mount
  useEffect(() => {
    // Clear any existing timer
    if (locationUpdateTimerRef.current) {
      clearInterval(locationUpdateTimerRef.current);
    }
    
    // Get location immediately
    fetchLocation();
    
    // Setup timer for periodic updates
    locationUpdateTimerRef.current = setInterval(() => {
      fetchLocation();
    }, 2000); // Reduced to 2 seconds for faster updates
    
    // Clean up interval when component unmounts
    return () => {
      if (locationUpdateTimerRef.current) {
        clearInterval(locationUpdateTimerRef.current);
      }
    };
  }, [fetchLocation]);

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
          <LocationLoadingState 
            loading={loading}
            error={error}
            getLocation={fetchLocation}
          />
          
          {!loading && !error && (
            <>
              <LocationDetails location={location} />
              <LocationSharingActions 
                location={location} 
                getLocation={fetchLocation}
                onManageContacts={() => setShowContactsModal(true)} 
              />
            </>
          )}
        </div>
      </div>
      
      {/* Trusted Contacts Modal */}
      <TrustedContactsModal
        isOpen={showContactsModal}
        onClose={() => setShowContactsModal(false)}
      />
    </div>
  );
};

export default LocationSharing;
