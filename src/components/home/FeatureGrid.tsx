
import { MapPin, Users, Bell, FileText, LifeBuoy, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeatureGridProps {
  onTrustedContactsClick: () => void;
}

const FeatureGrid = ({ onTrustedContactsClick }: FeatureGridProps) => {
  const navigate = useNavigate();

  const openCommunity = () => {
    window.open("https://nas.io/hersheild/feed", "_blank");
  };
  
  const openSupportChat = () => {
    window.open("https://isafebot.netlify.app", "_blank");
  };
  
  const openLocateMe = () => {
    window.open("https://graceful-blini-49da63.netlify.app/", "_blank");
  };
  
  const openFIR = () => {
    window.open("https://tally.so/r/nG5oGZ", "_blank");
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Location Sharing */}
      <button onClick={() => navigate('/location-sharing')} className="feature-card">
        <MapPin className="feature-icon h-8 w-8" />
        <span className="text-gray-800 text-lg">Location Sharing</span>
      </button>
      
      {/* Trusted Contacts */}
      <button onClick={onTrustedContactsClick} className="feature-card">
        <Users className="feature-icon h-8 w-8" />
        <span className="text-gray-800 text-lg">Trusted Contact</span>
      </button>
      
      {/* Community */}
      <button onClick={openCommunity} className="feature-card">
        <Users className="feature-icon h-8 w-8" />
        <span className="text-gray-800 text-lg">Community</span>
      </button>
      
      {/* Support - Replaces Siren */}
      <button 
        onClick={openSupportChat} 
        className="feature-card"
      >
        <LifeBuoy className="feature-icon h-8 w-8" />
        <span className="text-gray-800 text-lg">Support</span>
      </button>
      
      {/* Locate Me */}
      <button onClick={openLocateMe} className="feature-card">
        <MapPin className="feature-icon h-8 w-8" />
        <span className="text-gray-800 text-lg">Locate Me</span>
      </button>
      
      {/* Monitor Me - New feature */}
      <button onClick={() => navigate('/monitor-me')} className="feature-card">
        <Car className="feature-icon h-8 w-8" />
        <span className="text-gray-800 text-lg">Monitor Me</span>
      </button>
      
      {/* FIR */}
      <button onClick={openFIR} className="feature-card">
        <FileText className="feature-icon h-8 w-8" />
        <span className="text-gray-800 text-lg">FIR</span>
      </button>
    </div>
  );
};

export default FeatureGrid;
