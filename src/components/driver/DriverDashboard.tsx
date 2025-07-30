import React, { useState, useEffect } from 'react';
import { MapPin, Users, Play, Square, Navigation, Clock } from 'lucide-react';
import Header from '../Header';
import GoogleMap from '../GoogleMap';
import { locationService } from '../../services/locationService';
import { firebaseService } from '../../services/firebaseService';

interface DriverDashboardProps {
  driverData: { name: string; busNumber: string };
  onLogout: () => void;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ driverData, onLogout }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; speed?: number } | null>(null);
  const [studentsOnBus, setStudentsOnBus] = useState(12);
  const [tripStartTime, setTripStartTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [locationInterval, setLocationInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    if (isTracking && currentLocation) {
      // Update bus location in Firebase
      firebaseService.updateBusLocation(driverData.busNumber, currentLocation);
    }

    return () => {
      clearInterval(timeInterval);
      if (locationInterval) {
        clearInterval(locationInterval);
      }
    };
  }, [currentLocation, isTracking, driverData.busNumber]);

  const startTracking = () => {
    setIsTracking(true);
    setTripStartTime(new Date());
    
    locationService.startTracking((position) => {
      setCurrentLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        speed: position.coords.speed ? Math.round(position.coords.speed * 3.6) : Math.floor(Math.random() * 40) + 10 // Convert m/s to km/h or simulate
      });
    });

    // Simulate location updates for demo
    const interval = setInterval(() => {
      if (isTracking) {
        setCurrentLocation(prev => prev ? {
          lat: prev.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.lng + (Math.random() - 0.5) * 0.001,
          speed: Math.floor(Math.random() * 40) + 10
        } : null);
      }
    }, 2000);

    setLocationInterval(interval);
  };

  const stopTracking = () => {
    setIsTracking(false);
    setTripStartTime(null);
    
    if (locationInterval) {
      clearInterval(locationInterval);
      setLocationInterval(null);
    }
    
    locationService.stopTracking(() => {});
  };

  const mockBusStops = [
    { name: 'Main Gate', lat: 11.0168, lng: 76.9558 },
    { name: 'Library Stop', lat: 11.0178, lng: 76.9568 },
    { name: 'Hostel Block', lat: 11.0188, lng: 76.9578 },
    { name: 'Academic Block', lat: 11.0198, lng: 76.9588 }
  ];

  const defaultLocation = { lat: 11.0168, lng: 76.9558, speed: 0 };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Driver Dashboard" 
        userRole="driver" 
        userName={driverData.name}
        onLogout={onLogout} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Control</h3>
              <div className="space-y-4">
                {!isTracking ? (
                  <button
                    onClick={startTracking}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Play className="h-5 w-5" />
                    <span>Start Trip</span>
                  </button>
                ) : (
                  <button
                    onClick={stopTracking}
                    className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Square className="h-5 w-5" />
                    <span>End Trip</span>
                  </button>
                )}
                
                <div className={`p-4 rounded-lg text-center ${isTracking ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="font-medium">
                      {isTracking ? 'Live Tracking Active' : 'Tracking Inactive'}
                    </span>
                  </div>
                  {tripStartTime && (
                    <p className="text-sm">
                      Started: {tripStartTime.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Navigation className="h-5 w-5 mr-2 text-blue-600" />
                Current Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Speed:</span>
                  <span className="font-semibold text-blue-600">
                    <span className={isTracking ? 'animate-pulse' : ''}>{currentLocation?.speed || 0} km/h</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Bus Number:</span>
                  <span className="font-semibold">{driverData.busNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-semibold ${isTracking ? 'text-green-600' : 'text-gray-600'}`}>
                    <div className="flex items-center">
                      {isTracking && <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>}
                      {isTracking ? 'Broadcasting Live' : 'Stopped'}
                    </div>
                  </span>
                </div>
                {isTracking && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Update:</span>
                    <span className="font-semibold text-green-600 text-sm">
                      {currentTime.toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Passengers
              </h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{studentsOnBus}</div>
                <p className="text-gray-600">Students on board</p>
                <div className="mt-4 text-sm text-gray-500">
                  <p>Last update: {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-red-600" />
                Live GPS Tracking - {driverData.busNumber}
              </h3>
              <GoogleMap
                center={currentLocation || defaultLocation}
                busLocation={currentLocation || undefined}
                busStops={mockBusStops}
                className="h-96 w-full"
              />
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <MapPin className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-blue-900">Live Location</p>
                  <p className="text-xs text-blue-700">{isTracking ? 'Broadcasting' : 'Offline'}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <Navigation className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-green-900">GPS Status</p>
                  <p className="text-xs text-green-700">{isTracking ? 'Active' : 'Inactive'}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <Clock className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-orange-900">Next Stop</p>
                  <p className="text-xs text-orange-700">Library Stop</p>
                </div>
              </div>
              
              {/* Real-time tracking status */}
              {isTracking && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-900">Live Tracking Active</span>
                    </div>
                    <span className="text-xs text-green-700">Updates every 2 seconds</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;