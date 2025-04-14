
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import LocationDetails from '@/components/location/LocationDetails';
import LocationSharingActions from '@/components/location/LocationSharingActions';
import LocationLoadingState from '@/components/location/LocationLoadingState';
import { useState } from 'react';
import TrustedContactsModal from '@/components/TrustedContactsModal';

const LocationSharing = () => {
  const navigate = useNavigate();
  const { location, loading, error, getLocation } = useLocationTracking();
  const [showContactsModal, setShowContactsModal] = useState(false);

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
            getLocation={getLocation}
          />
          
          {!loading && !error && (
            <>
              <LocationDetails location={location} />
              <LocationSharingActions 
                location={location} 
                getLocation={getLocation}
                onManageContacts={() => setShowContactsModal(true)} 
              />
            </>
          )}
        </div>
      </div>
      
      {/* Add Trusted Contacts Modal */}
      <TrustedContactsModal
        isOpen={showContactsModal}
        onClose={() => setShowContactsModal(false)}
      />
    </div>
  );
};

export default LocationSharing;
