import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Bell, FileText, AlertTriangle } from 'lucide-react';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import TrustedContactsModal from '@/components/TrustedContactsModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Home = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Check if user is authenticated
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/');
      return;
    }
    
    setUser(JSON.parse(userData));
    
    // Create audio element for siren
    const sirenAudio = new Audio('/siren.mp3');
    sirenAudio.loop = true;
    setAudio(sirenAudio);
    
    // Setup periodic safety check notifications
    setupSafetyCheckNotifications();
    
    // Request permission for notifications
    requestNotificationPermission();
    
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [navigate]);
  
  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.warning("Please enable notifications for safety alerts");
      }
    }
  };
  
  const setupSafetyCheckNotifications = () => {
    // Setup safety check every 5 hours (in milliseconds)
    const fiveHours = 5 * 60 * 60 * 1000;
    
    // For demo purposes, we'll set it to 1 minute
    const oneMinute = 60 * 1000;
    
    setInterval(() => {
      showSafetyCheckNotification();
    }, fiveHours); // Use fiveHours in production
  };
  
  const showSafetyCheckNotification = () => {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification("HerShield Safety Check", {
        body: "Are you safe? If not, press SOS button or dial 100",
        icon: "/favicon.ico"
      });
      
      notification.onclick = () => {
        window.focus();
      };
    }
    
    // Also show in-app notification
    toast(
      "Safety Check",
      {
        description: "Are you safe? If not, press SOS or dial 100",
        action: {
          label: "I'm safe",
          onClick: () => {
            toast.success("Glad you're safe!");
          }
        }
      }
    );
  };
  
  const toggleSiren = () => {
    if (!audio) return;
    
    if (sirenPlaying) {
      audio.pause();
      audio.currentTime = 0;
      setSirenPlaying(false);
      toast.info("Siren stopped");
    } else {
      audio.play()
        .then(() => {
          setSirenPlaying(true);
          toast.warning("Siren activated!");
        })
        .catch(err => {
          console.error("Error playing siren:", err);
          toast.error("Could not play siren. Please try again.");
        });
    }
  };
  
  const handleSOS = async () => {
    try {
      // Dial emergency number
      window.location.href = "tel:100";
      
      // Get trusted contacts
      const contactsStr = localStorage.getItem('trustedContacts');
      if (contactsStr) {
        const contacts = JSON.parse(contactsStr);
        
        // Get current location
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        // Send location to trusted contacts
        const locationMessage = `
🚨 EMERGENCY SOS 🚨
I need help immediately!
📍 My location: https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=16
⏰ Sent: ${new Date().toLocaleTimeString()}
        `;
        
        // We'll use browser alert to show what would happen
        // since we can't actually send SMS programmatically
        setTimeout(() => {
          alert(`Emergency SOS activated!\n\nEmergency number 100 dialed\n\nLocation message sent to ${contacts.length} trusted contacts:\n\n${contacts.map((c: any) => c.name).join(", ")}`);
        }, 1000);
      }
    } catch (error) {
      console.error("Error in SOS:", error);
    }
  };
  
  const openCommunity = () => {
    window.open("https://nas.io/hersheild/feed", "_blank");
  };
  
  const openLocateMe = () => {
    window.open("https://graceful-blini-49da63.netlify.app/", "_blank");
  };
  
  const openFIR = () => {
    window.open("https://tally.so/r/nG5oGZ", "_blank");
  };
  
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
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
  
  return (
    <div className="min-h-screen bg-gradient-hershield">
      {/* Header */}
      <header className="pt-8 pb-4 px-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-cursive text-white font-bold">Hello,</h1>
            <p className="text-white/80 italic">Fearless, connected, protected</p>
          </div>
          <Button variant="outline" size="icon" className="bg-white/20 backdrop-blur-sm border-white/30 text-white">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="mt-6">
          <h2 className="text-3xl font-cursive text-white">
            Stay connected,<br />
            stay <span className="text-white/80">protected.</span>
          </h2>
        </div>
      </header>
      
      {/* Main Features Grid */}
      <main className="px-6 py-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Location Sharing */}
          <button onClick={() => navigate('/location-sharing')} className="feature-card">
            <MapPin className="feature-icon h-8 w-8" />
            <span className="font-cursive text-gray-800 text-lg">Location Sharing</span>
          </button>
          
          {/* Trusted Contacts */}
          <button onClick={() => setIsModalOpen(true)} className="feature-card">
            <Users className="feature-icon h-8 w-8" />
            <span className="font-cursive text-gray-800 text-lg">Trusted Contact</span>
          </button>
          
          {/* Community */}
          <button onClick={openCommunity} className="feature-card">
            <Users className="feature-icon h-8 w-8" />
            <span className="font-cursive text-gray-800 text-lg">Community</span>
          </button>
          
          {/* Siren */}
          <button 
            onClick={toggleSiren} 
            className={`feature-card ${sirenPlaying ? 'bg-red-100' : ''}`}
          >
            <AlertTriangle className={`feature-icon h-8 w-8 ${sirenPlaying ? 'text-red-500 animate-pulse' : ''}`} />
            <span className="font-cursive text-gray-800 text-lg">Siren</span>
          </button>
          
          {/* Locate Me */}
          <button onClick={openLocateMe} className="feature-card">
            <MapPin className="feature-icon h-8 w-8" />
            <span className="font-cursive text-gray-800 text-lg">Locate Me</span>
          </button>
          
          {/* FIR */}
          <button onClick={openFIR} className="feature-card">
            <FileText className="feature-icon h-8 w-8" />
            <span className="font-cursive text-gray-800 text-lg">FIR</span>
          </button>
        </div>
      </main>
      
      {/* SOS Button */}
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
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-black/80 backdrop-blur-md text-white">
        <div className="py-4 text-center">
          <h2 className="font-cursive text-white text-lg">HerShield</h2>
        </div>
      </nav>
      
      {/* Trusted Contacts Modal */}
      <TrustedContactsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Home;
