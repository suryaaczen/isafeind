
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Share2, MapPin, Users } from 'lucide-react';
import { formatLocationForSharing } from '@/utils/locationUtils';
import type { LocationData } from '@/hooks/useLocationTracking';

interface LocationSharingActionsProps {
  location: LocationData;
  getLocation: () => void;
  onManageContacts?: () => void;
}

const LocationSharingActions = ({ location, getLocation, onManageContacts }: LocationSharingActionsProps) => {
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
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={getLocation}
          variant="outline"
          className="w-full"
        >
          <MapPin className="mr-2 h-4 w-4" />
          Refresh Location
        </Button>
        
        <Button
          onClick={onManageContacts}
          variant="outline"
          className="w-full border-hershield-red text-hershield-red hover:bg-red-50"
        >
          <Users className="mr-2 h-4 w-4" />
          Manage Contacts
        </Button>
      </div>
      
      <Button
        onClick={shareLocation}
        className="w-full bg-hershield-red hover:bg-red-700 text-white"
      >
        <Share2 className="mr-2 h-4 w-4" />
        Share My Location
      </Button>
    </div>
  );
};

export default LocationSharingActions;
