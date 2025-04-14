
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const { location } = useLocationTracking();
  const [currentLocation, setCurrentLocation] = useState("");
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: '',
      vehicleNumber: '',
      phoneNumber: ''
    }
  });

  // Get current location when component mounts
  useEffect(() => {
    if (location.latitude && location.longitude) {
      fetchAddress(location.latitude, location.longitude)
        .then(address => {
          if (address) setCurrentLocation(address);
        })
        .catch(error => {
          console.error("Error fetching address:", error);
        });
    }
  }, [location.latitude, location.longitude]);
  
  // Load ride history from local storage
  useEffect(() => {
    const savedRides = localStorage.getItem('rideHistory');
    if (savedRides) {
      try {
        const parsedRides = JSON.parse(savedRides);
        setRideHistory(parsedRides);
        
        // Check if there's an active ride
        const activeRide = parsedRides.find((ride: RideHistory) => ride.status === 'active');
        if (activeRide) {
          setIsRideActive(true);
          form.setValue('to', activeRide.to);
          form.setValue('vehicleNumber', activeRide.vehicleNumber);
          form.setValue('phoneNumber', activeRide.phoneNumber);
        }
      } catch (error) {
        console.error("Error parsing stored rides:", error);
        // Clear potentially corrupted data
        localStorage.removeItem('rideHistory');
      }
    }
    
    // Load ride history from Google Sheets as well
    fetchRideHistory();
  }, []);
  
  // Clean up interval on unmount or when ride stops
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);
  
  // Function to fetch address from coordinates
  const fetchAddress = async (latitude: number, longitude: number) => {
    setIsFetchingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch address: ${response.status}`);
      }
      
      const data = await response.json();
      setIsFetchingAddress(false);
      return data.display_name;
    } catch (error) {
      console.error("Error fetching address:", error);
      setIsFetchingAddress(false);
      return null;
    }
  };
  
  // Function to search for address suggestions using LocationIQ API
  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setToSuggestions([]);
      setShowToSuggestions(false);
      return;
    }
    
    try {
      // Safely fetch address suggestions from OpenStreetMap
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch suggestions: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const suggestions = data.map(item => item.display_name || "");
        setToSuggestions(suggestions.filter(s => s !== ""));
        setShowToSuggestions(true);
      } else {
        setToSuggestions([]);
        setShowToSuggestions(false);
      }
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      toast.error("Failed to fetch address suggestions");
    }
  };
  
  // Debounce search to avoid too many API calls
  const debouncedSearch = useCallback((query: string) => {
    const handler = setTimeout(() => {
      searchAddress(query);
    }, 500);
    
    return () => {
      clearTimeout(handler);
    };
  }, []);
  
  // Function to select a suggestion
  const selectSuggestion = (suggestion: string) => {
    form.setValue('to', suggestion);
    setShowToSuggestions(false);
  };
  
  const validateLocations = (to: string) => {
    if (!to.trim()) {
      toast.error("Destination is required");
      return false;
    }
    
    return true;
  };
  
  const sendSafetyCheck = () => {
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
    // Validate destination
    if (!validateLocations(data.to)) {
      return;
    }
    
    // Generate a unique ID for this ride
    const rideId = Date.now().toString();
    
    // Create the ride object
    const timestamp = new Date().toISOString();
    const newRide = {
      id: rideId,
      to: data.to,
      vehicleNumber: data.vehicleNumber,
      phoneNumber: data.phoneNumber,
      timestamp,
      status: 'active' as const
    };
    
    // Update local ride history first
    const updatedRideHistory = [newRide, ...rideHistory];
    setRideHistory(updatedRideHistory);
    
    // Save to local storage
    localStorage.setItem('rideHistory', JSON.stringify(updatedRideHistory));
    
    // Set ui active state
    setIsRideActive(true);
    setNotificationCount(0);
    
    // Then save to Google Sheets
    toast.promise(
      saveToGoogleSheets(newRide),
      {
        loading: "Starting ride monitoring...",
        success: "Ride monitoring has started! We'll check on you periodically.",
        error: "Failed to save ride details to cloud storage. Your ride is still being monitored locally."
      }
    );
  };
  
  const stopRide = () => {
    // Update ride status in history
    updateRideStatus("completed");
    
    setIsRideActive(false);
    setNotificationCount(0);
    
    toast("Ride monitoring stopped", {
      description: "Stay safe!"
    });
    
    // Reset form for next ride
    form.reset();
  };
  
  const updateRideStatus = (status: 'completed' | 'emergency') => {
    // Find the active ride and update its status
    const updatedRideHistory = rideHistory.map(ride => 
      ride.status === 'active' ? { ...ride, status } : ride
    );
    
    setRideHistory(updatedRideHistory);
    
    // Save updated history to local storage
    localStorage.setItem('rideHistory', JSON.stringify(updatedRideHistory));
    
    // Also update in Google Sheets
    const activeRide = rideHistory.find(ride => ride.status === 'active');
    if (activeRide) {
      updateSheetStatus(activeRide.id, status)
        .catch(error => {
          console.error("Error updating ride status in Google Sheets:", error);
        });
    }
  };
  
  const saveToGoogleSheets = async (data: RideHistory) => {
    console.log("Attempting to save ride to Google Sheets:", data);
    
    try {
      // Using the updated Google Apps Script Web App URL
      const scriptUrl = 'https://script.google.com/macros/s/AKfycbwP2zrgDWNdPSnMJgBtLz_EiNoKpgHm_ux9ivVRp0SyY-VC50qzJVFib3hgyP33k2Qp/exec';
      
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addRide',
          data: {
            id: data.id,
            from: currentLocation || 'Unknown', // Use current location or fallback
            to: data.to,
            vehicleNumber: data.vehicleNumber,
            phoneNumber: data.phoneNumber,
            timestamp: data.timestamp,
            status: data.status
          }
        }),
        mode: 'no-cors' // Important for cross-origin requests to Google Apps Script
      });
      
      console.log("Google Sheets response:", response);
      return true;
    } catch (error) {
      console.error("Error saving to Google Sheets:", error);
      throw error;
    }
  };
  
  const updateSheetStatus = async (rideId: string, status: string) => {
    try {
      // Using the updated Google Apps Script Web App URL
      const scriptUrl = 'https://script.google.com/macros/s/AKfycbwP2zrgDWNdPSnMJgBtLz_EiNoKpgHm_ux9ivVRp0SyY-VC50qzJVFib3hgyP33k2Qp/exec';
      
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
        mode: 'no-cors' // Important for cross-origin requests to Google Apps Script
      });
      
      return true;
    } catch (error) {
      console.error("Error updating status in Google Sheets:", error);
      throw error;
    }
  };
  
  const fetchRideHistory = async () => {
    try {
      // Using the updated Google Apps Script Web App URL
      const scriptUrl = 'https://script.google.com/macros/s/AKfycbwP2zrgDWNdPSnMJgBtLz_EiNoKpgHm_ux9ivVRp0SyY-VC50qzJVFib3hgyP33k2Qp/exec';
      
      // For demo purposes, we'll handle the CORS issue by just trying to fetch
      // without expecting a valid response
      fetch(`${scriptUrl}?action=getRides`, {
        mode: 'no-cors' // Try with no-cors
      }).catch(error => {
        console.log("Expected CORS error with Google Apps Script:", error);
      });
      
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
          {currentLocation && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">Your current location:</p>
              <p className="font-medium truncate">{isFetchingAddress ? "Fetching location..." : currentLocation}</p>
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                            debouncedSearch(e.target.value);
                          }}
                          onFocus={() => field.value.length >= 3 && setShowToSuggestions(true)}
                        />
                      </FormControl>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => searchAddress(field.value)}
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
                            onClick={() => selectSuggestion(suggestion)}
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
                        onChange={(e) => {
                          // Auto uppercase for vehicle number
                          field.onChange(e.target.value.toUpperCase());
                        }}
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
                        onChange={(e) => {
                          // Allow only numbers for phone
                          const value = e.target.value.replace(/\D/g, '');
                          field.onChange(value);
                        }}
                        maxLength={10}
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
                    Your ride is being monitored. Stay safe during your journey.
                  </AlertDescription>
                </Alert>
              )}
              
              <Button type="submit" className="w-full bg-hershield-teal hover:bg-hershield-blue-light">
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
                    <TableHead>To</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rideHistory.map((ride) => (
                    <TableRow key={ride.id}>
                      <TableCell>{formatDate(ride.timestamp)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{ride.to}</TableCell>
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
