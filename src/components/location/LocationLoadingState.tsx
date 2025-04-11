
import { Button } from '@/components/ui/button';

interface LocationLoadingStateProps {
  loading: boolean;
  error: string | null;
  getLocation: () => void;
}

const LocationLoadingState = ({ loading, error, getLocation }: LocationLoadingStateProps) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-hershield-red border-t-transparent rounded-full mb-4"></div>
        <p>Getting your location...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button 
          onClick={getLocation}
          className="bg-hershield-red hover:bg-red-700 text-white"
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  return null;
};

export default LocationLoadingState;
