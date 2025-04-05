
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useToast } from "@/components/ui/use-toast";

declare global {
  interface Window {
    otpless: any;
  }
}

const Auth = () => {
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load OTPless script
    const script = document.createElement('script');
    script.src = 'https://otpless.com/auth.js';
    script.async = true;
    document.body.appendChild(script);

    // Initialize OTPless
    script.onload = () => {
      window.otpless = (otplessUser: any) => {
        handleOtplessResponse(otplessUser);
      };
    };

    return () => {
      // Clean up
      document.body.removeChild(script);
    };
  }, []);

  const handleOtplessResponse = (otplessUser: any) => {
    setLoading(true);
    // Process user data from OTPless
    console.log("OTPless response:", otplessUser);
    
    if (otplessUser && otplessUser.token) {
      // Save user data to localStorage
      // Check if email data exists
      const userData = {
        token: otplessUser.token,
        mobile: otplessUser.data?.mobile || '',
        email: otplessUser.email?.email || '',
        name: otplessUser.email?.name || 'User',
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast.success("Authentication successful!");
      
      // Navigate to home page
      setTimeout(() => {
        navigate('/home');
      }, 1000);
    } else {
      toast.error("Authentication failed. Please try again.");
      setLoading(false);
    }
  };

  const initiateOtplessAuth = () => {
    if (window.otpless) {
      window.otpless.auth({
        appId: "LH0ZCF94U8IIZR5MZQUL",
        clientId: "U7P67OYYNO6KBL031TQ61SGB2CM3STO1",
        clientSecret: "nxa6zhfxi60hikmermt82ak1tyh17aki",
        callback: handleOtplessResponse
      });
    } else {
      uiToast({
        title: "Error",
        description: "OTPless is not loaded. Please refresh the page.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-hershield p-4">
      <div className="max-w-md w-full space-y-8 p-8 rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl">
        <div className="text-center">
          <h1 className="text-5xl font-cursive font-bold text-hershield-red">
            iSafe
          </h1>
          <p className="mt-2 text-gray-600 italic">Guardian Alert System</p>
          
          <div className="mt-6 space-y-2">
            <p className="text-gray-700">Fearless, connected, protected</p>
            <h2 className="text-2xl font-cursive text-hershield-red">
              Stay connected, stay protected.
            </h2>
          </div>
        </div>
        
        <div className="mt-8">
          <button
            onClick={initiateOtplessAuth}
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-hershield-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-200"
          >
            {loading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              "Login with OTPless"
            )}
          </button>
          
          <p className="mt-4 text-sm text-center text-gray-600">
            Secure, quick login with your phone number
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
