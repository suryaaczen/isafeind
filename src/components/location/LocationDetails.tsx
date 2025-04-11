
import type { LocationData } from '@/hooks/useLocationTracking';

interface LocationDetailsProps {
  location: LocationData;
}

const LocationDetails = ({ location }: LocationDetailsProps) => {
  return (
    <div className="mb-6">
      <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
        {location.latitude && location.longitude ? (
          <iframe
            title="Your Location"
            width="100%"
            height="100%"
            frameBorder="0"
            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${location.latitude},${location.longitude}&zoom=18`}
            allowFullScreen
          ></iframe>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200">
            <p>Map not available</p>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-500">Latitude</p>
            <p className="font-medium">{location.latitude?.toFixed(6) || 'N/A'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-500">Longitude</p>
            <p className="font-medium">{location.longitude?.toFixed(6) || 'N/A'}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-500">Accuracy</p>
            <p className="font-medium">{location.accuracy ? `${Math.round(location.accuracy)}m` : 'N/A'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-500">Altitude</p>
            <p className="font-medium">{location.altitude ? `${Math.round(location.altitude)}m` : 'N/A'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-500">Speed</p>
            <p className="font-medium">{location.speed ? `${Math.round(location.speed * 3.6)}km/h` : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDetails;
