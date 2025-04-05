
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const userData = localStorage.getItem('user');
    if (userData) {
      // If user data exists and is not expired, go to home
      try {
        const user = JSON.parse(userData);
        const timestamp = new Date(user.timestamp).getTime();
        const now = new Date().getTime();
        const oneDay = 24 * 60 * 60 * 1000;
        
        if (now - timestamp < oneDay) {
          navigate('/home');
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        // Clear invalid data
        localStorage.removeItem('user');
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-hershield p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-6xl font-cursive font-bold text-white">
          iSafe
        </h1>
        <p className="text-xl text-white/80 italic">Guardian Alert System</p>
        
        <div className="mt-8 space-y-4 px-4">
          <p className="text-white/90 text-lg">
            Your personal safety companion. Stay protected, stay connected.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mt-6">
            <p className="text-white font-medium">Features:</p>
            <ul className="text-white/80 text-left mt-2 space-y-1">
              <li>• Emergency location sharing</li>
              <li>• Trusted contacts alerts</li>
              <li>• Emergency siren</li>
              <li>• Quick access to FIR filing</li>
              <li>• Community support</li>
              <li>• One-tap SOS</li>
            </ul>
          </div>
          
          <Button 
            onClick={() => navigate('/auth')}
            className="w-full py-6 mt-8 bg-white text-hershield-red hover:bg-white/90 font-semibold text-lg shadow-lg"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
