
import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

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
      // Dial emergency number
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
📍 My location: https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=16
⏰ Sent: ${new Date().toLocaleTimeString()}
              `;
              
              // We'll use console.log to show what would happen in a real implementation
              console.log("SOS location update sent:", locationMessage);
            },
            (error) => {
              console.error("Error getting location for SOS:", error);
            },
            { 
              enableHighAccuracy: true,
              maximumAge: 0,
              timeout: 10000
            }
          );
          
          setLocationWatchId(watchId);
        }
        
        // We'll use browser alert to show what would happen
        setTimeout(() => {
          alert(`Emergency SOS activated!\n\nEmergency number 100 dialed\n\nLocation message sent to ${contacts.length} trusted contacts:\n\n${contacts.map((c: any) => c.name).join(", ")}`);
        }, 1000);
      }
    } catch (error) {
      console.error("Error in SOS:", error);
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
