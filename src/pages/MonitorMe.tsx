
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, CheckCircle, Search } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLocationTracking } from '@/hooks/useLocationTracking';

// Define ride history interface
interface RideHistory {
  id: string;
  from: string;
  to: string;
  vehicleNumber: string;
  phoneNumber: string;
  timestamp: string;
  status: 'active' | 'completed' | 'emergency';
}

// Indian vehicle number format validation
// Format: AA00AA0000 or AA00A0000 (state code + district code + series + number)
const vehicleNumberRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/;

const formSchema = z.object({
  from: z.string().min(3, "Starting location is required"),
  to: z.string().min(3, "Destination is required"),
  vehicleNumber: z.string().regex(vehicleNumberRegex, "Enter a valid Indian vehicle number (e.g., MH02AB1234)"),
  phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits")
});

type FormValues = z.infer<typeof formSchema>;

const MonitorMe = () => {
  const navigate = useNavigate();
  const [isRideActive, setIsRideActive] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const [rideHistory, setRideHistory] = useState<RideHistory[]>([]);
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const { location } = useLocationTracking();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from: '',
      to: '',
      vehicleNumber: '',
      phoneNumber: ''
    }
  });

  // Get current location and update the from field when component mounts
  useEffect(() => {
    if (location.latitude && location.longitude) {
      fetchAddress(location.latitude, location.longitude)
        .then(address => {
          if (address) form.setValue('from', address);
        });
    }
  }, [location.latitude, location.longitude]);
  
  // Clean up interval on unmount or when ride stops
  useEffect(() => {
    // Load ride history when component mounts
    fetchRideHistory();
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);
  
  // Function to fetch address from coordinates
  const fetchAddress = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name;
    } catch (error) {
      console.error("Error fetching address:", error);
      return null;
    }
  };
  
  // Function to search for address suggestions
  const searchAddress = async (query: string, isFrom: boolean) => {
    if (query.length < 3) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`
      );
      const data = await response.json();
      const suggestions = data.map((item: any) => item.display_name);
      
      if (isFrom) {
        setFromSuggestions(suggestions);
        setShowFromSuggestions(true);
      } else {
        setToSuggestions(suggestions);
        setShowToSuggestions(true);
      }
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
    }
  };
  
  // Function to select a suggestion
  const selectSuggestion = (suggestion: string, isFrom: boolean) => {
    if (isFrom) {
      form.setValue('from', suggestion);
      setShowFromSuggestions(false);
    } else {
      form.setValue('to', suggestion);
      setShowToSuggestions(false);
    }
  };
  
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
    
    // Update ride status in history
    updateRideStatus("emergency");
    
    // Show alert
    toast.error("Emergency Alert", {
      description: "Dialing emergency services...",
      duration: 5000
    });
    
    // Dial emergency number
    window.location.href = "tel:100";
  };
  
  const startRide = (data: FormValues) => {
    // Validate locations are in the same state
    if (!validateLocations(data.from, data.to)) {
      toast.error("Starting and destination locations must be in the same state.");
      return;
    }
    
    // Generate a unique ID for this ride
    const rideId = Date.now().toString();
    
    // Save to Google Sheets using their API
    const timestamp = new Date().toISOString();
    const newRide = {
      id: rideId,
      from: data.from,
      to: data.to,
      vehicleNumber: data.vehicleNumber,
      phoneNumber: data.phoneNumber,
      timestamp,
      status: 'active' as const
    };
    
    saveToGoogleSheets(newRide);
    
    // Update local ride history
    setRideHistory(prev => [newRide, ...prev]);
    
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
    
    // Update ride status in history
    updateRideStatus("completed");
    
    setIsRideActive(false);
    setNotificationCount(0);
    
    toast("Ride monitoring stopped", {
      description: "Stay safe!"
    });
  };
  
  const updateRideStatus = (status: 'completed' | 'emergency') => {
    // Find the active ride and update its status
    setRideHistory(prev => prev.map(ride => 
      ride.status === 'active' ? { ...ride, status } : ride
    ));
    
    // Also update in Google Sheets
    const activeRide = rideHistory.find(ride => ride.status === 'active');
    if (activeRide) {
      updateSheetStatus(activeRide.id, status);
    }
  };
  
  const saveToGoogleSheets = async (data: RideHistory) => {
    try {
      // Using a Google Apps Script Web App as a proxy to write to Google Sheets
      // This URL should be replaced with your actual Google Apps Script Web App URL
      const scriptUrl = 'https://script.google.com/macros/s/AKfycbyBWg4RuLnyY7hZ7cFZCObzgokzbvCbCXUE2w_SkVS5XA76pXtx_RQ4aHlTe5zgyMqE0g/exec';
      
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addRide',
          data: {
            id: data.id,
            from: data.from,
            to: data.to,
            vehicleNumber: data.vehicleNumber,
            phoneNumber: data.phoneNumber,
            timestamp: data.timestamp,
            status: data.status
          }
        }),
      });
      
      console.log("Google Sheets response:", response);
      
      toast.success("Ride details saved", {
        description: "Your journey has been recorded for safety"
      });
    } catch (error) {
      console.error("Error saving to Google Sheets:", error);
      toast.error("Failed to save ride details");
    }
  };
  
  const updateSheetStatus = async (rideId: string, status: string) => {
    try {
      // Using the same Google Apps Script Web App to update status
      const scriptUrl = 'https://script.google.com/macros/s/AKfycbyBWg4RuLnyY7hZ7cFZCObzgokzbvCbCXUE2w_SkVS5XA76pXtx_RQ4aHlTe5zgyMqE0g/exec';
      
      await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateStatus',
          data: {
            id: rideId,
            status: status
          }
        }),
      });
    } catch (error) {
      console.error("Error updating status in Google Sheets:", error);
    }
  };
  
  const fetchRideHistory = async () => {
    try {
      // Using the same Google Apps Script Web App to fetch ride history
      const scriptUrl = 'https://script.google.com/macros/s/AKfycbyBWg4RuLnyY7hZ7cFZCObzgokzbvCbCXUE2w_SkVS5XA76pXtx_RQ4aHlTe5zgyMqE0g/exec';
      
      const response = await fetch(`${scriptUrl}?action=getRides`);
      const data = await response.json();
      
      if (data.success && Array.isArray(data.rides)) {
        setRideHistory(data.rides);
        
        // Check if there's an active ride
        const activeRide = data.rides.find((ride: RideHistory) => ride.status === 'active');
        if (activeRide) {
          setIsRideActive(true);
          // Set up safety checks again
          const id = window.setInterval(() => {
            sendSafetyCheck();
          }, 10 * 60 * 1000); // 10 minutes
          setIntervalId(id);
        }
      }
    } catch (error) {
      console.error("Error fetching ride history:", error);
    }
  };
  
  const onSubmit = (data: FormValues) => {
    if (isRideActive) {
      stopRide();
    } else {
      startRide(data);
    }
  };
  
  // Format date from ISO string
  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString();
    } catch (e) {
      return isoString;
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
        
        <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="from"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>Starting Location</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          placeholder="Enter your starting point" 
                          {...field} 
                          disabled={isRideActive}
                          onChange={(e) => {
                            field.onChange(e);
                            searchAddress(e.target.value, true);
                          }}
                          onFocus={() => setShowFromSuggestions(true)}
                        />
                      </FormControl>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => searchAddress(field.value, true)}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    {showFromSuggestions && fromSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                        {fromSuggestions.map((suggestion, index) => (
                          <div 
                            key={index}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => selectSuggestion(suggestion, true)}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="to"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>Destination</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          placeholder="Enter your destination" 
                          {...field} 
                          disabled={isRideActive}
                          onChange={(e) => {
                            field.onChange(e);
                            searchAddress(e.target.value, false);
                          }}
                          onFocus={() => setShowToSuggestions(true)}
                        />
                      </FormControl>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => searchAddress(field.value, false)}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    {showToSuggestions && toSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                        {toSuggestions.map((suggestion, index) => (
                          <div 
                            key={index}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => selectSuggestion(suggestion, false)}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
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
                      <Input 
                        placeholder="Format: MH02AB1234" 
                        {...field} 
                        disabled={isRideActive}
                      />
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
                      <Input 
                        placeholder="10-digit phone number" 
                        {...field} 
                        disabled={isRideActive}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
        
        {/* Ride History Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Ride History</h2>
          
          {rideHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rideHistory.map((ride) => (
                    <TableRow key={ride.id}>
                      <TableCell>{formatDate(ride.timestamp)}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{ride.from}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{ride.to}</TableCell>
                      <TableCell>{ride.vehicleNumber}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          ride.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : ride.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {ride.status === 'active' 
                            ? 'Active' 
                            : ride.status === 'completed'
                              ? 'Completed'
                              : 'Emergency'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No ride history available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonitorMe;
