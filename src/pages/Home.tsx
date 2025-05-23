
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TrustedContactsModal from '@/components/TrustedContactsModal';
import Header from '@/components/home/Header';
import FeatureGrid from '@/components/home/FeatureGrid';
import SOSButton from '@/components/home/SOSButton';
import Footer from '@/components/home/Footer';
import VoiceEmergencyDetector from '@/components/home/VoiceEmergencyDetector';
import { useSafetyCheck } from '@/hooks/useSafetyCheck';

const Home = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [voiceDetectionEnabled, setVoiceDetectionEnabled] = useState(true);
  
  // Initialize safety check system
  useSafetyCheck();
  
  useEffect(() => {
    // Check if user is authenticated
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/');
      return;
    }
    
    setUser(JSON.parse(userData));
    
    // Request microphone permission for voice detection
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          console.log("Microphone permission granted");
        })
        .catch((error) => {
          console.error("Microphone permission denied:", error);
          setVoiceDetectionEnabled(false);
        });
    }
  }, [navigate]);
  
  return (
    <div className="min-h-screen bg-gradient-hershield">
      {/* Voice Emergency Detector */}
      <VoiceEmergencyDetector enabled={voiceDetectionEnabled} />
      
      {/* Header */}
      <Header userName={user?.name} />
      
      {/* Main Features Grid */}
      <main className="px-6 py-4">
        <FeatureGrid onTrustedContactsClick={() => setIsModalOpen(true)} />
      </main>
      
      {/* SOS Button */}
      <SOSButton />
      
      {/* Bottom Navigation */}
      <Footer />
      
      {/* Trusted Contacts Modal */}
      <TrustedContactsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Home;
