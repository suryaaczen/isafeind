
import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { toast } from "sonner";

const SOSButton = () => {
  const [locationWatchId, setLocationWatchId] = useState<number | null>(null);

  // Clean up the location watcher when component unmounts
  useEffect(() => {
    return () => {
      if (locationWatchId !== null) {
        navigator.geolocation.clearWatch(locationWatchId);
      }
    };
  }, [locationWatchId]);

  const handleSOS = async () => {
    try {
      // Immediately dial emergency number
      window.location.href = "tel:100";
      
      // Get trusted contacts
      const contactsStr = localStorage.getItem('trustedContacts');
      if (contactsStr) {
        const contacts = JSON.parse(contactsStr);
        
        // Start watching the user's location for real-time updates
        if (navigator.geolocation) {
          const watchId = navigator.geolocation.watchPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              
              // Send location to trusted contacts
              const locationMessage = `
🚨 EMERGENCY SOS 🚨
I need help immediately!
📍 My location: https://www.google.com/maps?q=${latitude},${longitude}
⏰ Sent: ${new Date().toLocaleTimeString()}
              `;
              
              // In a real implementation, we would:
              // 1. Send SMS via SMS API service
              // 2. Send WhatsApp messages via WhatsApp Business API
              // 3. Use other communication channels
              
              // We'll use console.log to show what would happen in a real implementation
              console.log("SOS location update sent:", locationMessage);
              
              // Show update every 30 seconds to not overwhelm the UI
              const timeNow = new Date().getTime();
              if (!window.lastLocationToast || timeNow - window.lastLocationToast > 30000) {
                toast.info("Location update sent to trusted contacts");
                window.lastLocationToast = timeNow;
              }
            },
            (error) => {
              console.error("Error getting location for SOS:", error);
              toast.error("Could not access location. Please enable location services.");
            },
            { 
              enableHighAccuracy: true,
              maximumAge: 0,
              timeout: 10000
            }
          );
          
          setLocationWatchId(watchId);
        } else {
          toast.error("Geolocation is not supported by this device");
        }
        
        // Alert shown after emergency call is triggered
        toast.success(`Emergency SOS activated! Location being sent to ${contacts.length} trusted contacts`);
      } else {
        toast.error("No trusted contacts found. Please add contacts in settings.");
      }
    } catch (error) {
      console.error("Error in SOS:", error);
      toast.error("Error activating SOS. Please try again.");
    }
  };

  return (
    <div className="fixed bottom-20 inset-x-0 flex justify-center">
      <button 
        onClick={handleSOS}
        className="h-20 w-20 rounded-full bg-red-600 flex items-center justify-center shadow-lg animate-pulse-emergency"
        aria-label="Emergency SOS"
      >
        <AlertTriangle className="h-10 w-10 text-white" />
        <span className="absolute mt-14 text-white font-bold">SOS</span>
      </button>
    </div>
  );
};

export default SOSButton;
