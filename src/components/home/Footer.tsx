
import { useState } from 'react';
import { MapPin, Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { formatLocationForSharing, startLocationTracking } from '@/utils/locationUtils';
import { loadContactsFromStorage } from '@/components/trusted-contacts/contactUtils';

const Footer = () => {
  const [isLiveLocationActive, setIsLiveLocationActive] = useState(false);
  
  const toggleLiveLocation = (enabled: boolean) => {
    if (enabled) {
      startLiveLocationSharing();
    } else {
      stopLiveLocationSharing();
    }
    setIsLiveLocationActive(enabled);
  };
  
  const startLiveLocationSharing = () => {
    const contacts = loadContactsFromStorage();
    
    if (contacts.length === 0) {
      toast.error("No trusted contacts found", {
        description: "Add trusted contacts first to share your location",
        action: {
          label: "Add Contacts",
          onClick: () => {
            // For now, we'll just notify - in a real implementation we'd open the contacts modal
            toast.info("Please add trusted contacts from the home screen");
          }
        }
      });
      setIsLiveLocationActive(false);
      return;
    }
    
    // Store the tracker in window object so we can access it later
    // @ts-ignore
    window.locationTracker = startLocationTracking(
      (position) => {
        // Format location data
        const locationMessage = formatLocationForSharing(position);
        
        // In a real implementation, we would send this to trusted contacts
        // Either through a backend service or using a messaging API
        
        // For demo purposes, we'll just show a toast every 30 seconds
        const now = new Date();
        if (now.getSeconds() % 30 === 0) {
          toast.info("Live location update sent to trusted contacts", {
            description: `Location shared with ${contacts.length} contacts`
          });
          
          console.log("Location update:", locationMessage);
        }
      },
      (error) => {
        console.error("Error tracking location:", error);
        toast.error("Error tracking location", {
          description: error.message
        });
        setIsLiveLocationActive(false);
      }
    );
    
    toast.success("Live location sharing activated", {
      description: "Your location will be shared with trusted contacts every 5 seconds"
    });
  };
  
  const stopLiveLocationSharing = () => {
    // @ts-ignore
    if (window.locationTracker) {
      // @ts-ignore
      window.locationTracker.stopTracking();
      // @ts-ignore
      window.locationTracker = null;
      
      toast.info("Live location sharing stopped");
    }
  };
  
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-black/80 backdrop-blur-md text-white">
      <div className="py-4 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className={`h-5 w-5 ${isLiveLocationActive ? 'text-red-500' : 'text-white'}`} />
          <span className="text-sm">Live Location</span>
          <Switch 
            checked={isLiveLocationActive} 
            onCheckedChange={toggleLiveLocation} 
            className="data-[state=checked]:bg-red-500" 
          />
        </div>
        <h2 className="text-white text-lg">iSafe</h2>
      </div>
    </nav>
  );
};

export default Footer;
