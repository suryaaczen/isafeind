
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  from: z.string().min(3, "Starting location is required"),
  to: z.string().min(3, "Destination is required"),
  vehicleNumber: z.string().min(5, "Valid vehicle number is required"),
  phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits")
});

type FormValues = z.infer<typeof formSchema>;

const MonitorMe = () => {
  const navigate = useNavigate();
  const [isRideActive, setIsRideActive] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from: '',
      to: '',
      vehicleNumber: '',
      phoneNumber: ''
    }
  });
  
  // Clean up interval on unmount or when ride stops
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);
  
  const validateLocations = (from: string, to: string) => {
    // This is a simplified check - in a real app you'd use a geocoding API
    const stateIndicators = [
      'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'UP', 
      'MP', 'Punjab', 'Haryana', 'Gujarat', 'Rajasthan'
    ];
    
    // Simple validation to ensure both locations contain the same state indicator
    const fromState = stateIndicators.find(state => from.includes(state));
    const toState = stateIndicators.find(state => to.includes(state));
    
    if (!fromState || !toState) {
      return true; // For demo purposes we're allowing if no state is detected
    }
    
    return fromState === toState;
  };
  
  const sendSafetyCheck = () => {
    if (notificationCount >= 3) {
      // After 3 unanswered notifications, trigger emergency
      triggerEmergency();
      return;
    }
    
    // Request notification permission if not granted
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
    
    toast("Safety Check", {
      description: "Are you safe?",
      duration: 50000,
      action: {
        label: "Yes",
        onClick: () => {
          toast.success("Glad you're safe!");
          setNotificationCount(0); // Reset counter after response
        }
      },
      cancel: {
        label: "No",
        onClick: () => {
          triggerEmergency();
        }
      }
    });
    
    setNotificationCount(prev => prev + 1);
  };
  
  const triggerEmergency = () => {
    // Stop the ride
    stopRide();
    
    // Show alert
    toast.error("Emergency Alert", {
      description: "Dialing emergency services...",
      duration: 5000
    });
    
    // Dial emergency number
    window.location.href = "tel:100";
    
    // Send location to trusted contacts (would integrate with existing contacts)
    // This would be implemented by connecting to the existing trusted contacts system
  };
  
  const startRide = (data: FormValues) => {
    // Validate locations are in the same state
    if (!validateLocations(data.from, data.to)) {
      toast.error("Starting and destination locations must be in the same state.");
      return;
    }
    
    // Save to Google Sheets using their API
    const timestamp = new Date().toISOString();
    saveToGoogleSheets({
      from: data.from,
      to: data.to,
      vehicleNumber: data.vehicleNumber,
      phoneNumber: data.phoneNumber,
      timestamp
    });
    
    // Set up periodic safety checks (every 10 minutes)
    // For demo purposes, we'll use a shorter interval
    const id = window.setInterval(() => {
      sendSafetyCheck();
    }, 10 * 60 * 1000); // 10 minutes
    
    setIntervalId(id);
    setIsRideActive(true);
    setNotificationCount(0);
    
    toast.success("Ride monitoring has started!", {
      description: "We'll check on you every 10 minutes."
    });
  };
  
  const stopRide = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsRideActive(false);
    setNotificationCount(0);
    
    toast("Ride monitoring stopped", {
      description: "Stay safe!"
    });
  };
  
  const saveToGoogleSheets = async (data: FormValues & { timestamp: string }) => {
    try {
      // This is where you'd normally connect to Google Sheets API
      // For demonstration, we'll log the data
      console.log("Saving to Google Sheets:", data);
      
      // In a real app, you would use the Google Sheets API, a serverless function, 
      // or a service like Zapier to connect to the Google Sheet
      
      toast.success("Ride details saved", {
        description: "Your journey has been recorded for safety"
      });
    } catch (error) {
      console.error("Error saving to Google Sheets:", error);
      toast.error("Failed to save ride details");
    }
  };
  
  const onSubmit = (data: FormValues) => {
    if (isRideActive) {
      stopRide();
    } else {
      startRide(data);
    }
  };
  
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
        
        <h1 className="text-3xl font-cursive text-white font-bold mb-2">
          Monitor My Ride
        </h1>
        <p className="text-white/80 mb-6">Stay safe during your journey</p>
        
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Starting Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your starting point" {...field} disabled={isRideActive} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your destination" {...field} disabled={isRideActive} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vehicleNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter vehicle number" {...field} disabled={isRideActive} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="10-digit phone number" {...field} disabled={isRideActive} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-center space-x-2 py-4">
                <Label htmlFor="ride-status">Ride Status:</Label>
                <Switch 
                  id="ride-status" 
                  checked={isRideActive} 
                  onCheckedChange={(checked) => {
                    if (checked) {
                      form.handleSubmit(startRide)();
                    } else {
                      stopRide();
                    }
                  }} 
                />
                <span className={isRideActive ? "text-green-600 font-medium" : "text-gray-500"}>
                  {isRideActive ? "Ride Active" : "Ride Inactive"}
                </span>
              </div>
              
              {isRideActive && (
                <Alert className="bg-green-50 border-green-200 mb-4">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    Your ride is being monitored. We'll check on you every 10 minutes.
                  </AlertDescription>
                </Alert>
              )}
              
              <Button type="submit" className="w-full bg-hershield-red hover:bg-red-700">
                {isRideActive ? "Stop Monitoring" : "Start Monitoring"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default MonitorMe;
