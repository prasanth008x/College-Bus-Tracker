import React, { useState, useEffect } from 'react';
import { MapPin, Clock, User, Bell, CheckCircle, Navigation } from 'lucide-react';
import Header from '../Header';
import GoogleMap from '../GoogleMap';
import { Bus } from '../../types';
import { firebaseService } from '../../services/firebaseService';

interface StudentDashboardProps {
  studentData: { name: string; busNumber: string; studentId: string };
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ studentData, onLogout }) => {
  const [busData, setBusData] = useState<Bus | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [driverName, setDriverName] = useState('Loading...');
  const [unsubscriber, setUnsubscriber] = useState<(() => void) | null>(null);

  useEffect(() => {
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Mark attendance on login
    setAttendanceMarked(true);
    setNotification('Attendance marked successfully! ✓');
    setTimeout(() => setNotification(null), 3000);

    // Subscribe to bus location updates
    const unsubscribe = firebaseService.subscribeToBusLocation(
      studentData.busNumber,
      (bus) => {
        setBusData(bus);
        
        // Update driver name from bus data
        if (bus && bus.driverName) {
          setDriverName(bus.driverName);
        } else {
          setDriverName('Not Assigned');
        }
        
        // Check if bus is approaching (mock logic)
        if (bus?.currentLocation) {
          // This would normally check distance to student's stop
          const speed = bus.currentLocation.speed || 0;
          if (speed > 0 && speed < 10) { // Bus is moving slowly, might be approaching
            setNotification('🚌 Bus is arriving soon at your stop!');
            setTimeout(() => setNotification(null), 5000);
          }
        }
      }
    );

    setUnsubscriber(() => unsubscribe);
    
    return () => {
      if (unsubscriber) {
        unsubscriber();
      }
      clearInterval(timeInterval);
      
      // Mark student as offline when component unmounts
      if (studentData.studentId) {
        firebaseService.logoutStudent(studentData.studentId);
      }
    };
  }, [studentData.busNumber, studentData.studentId]);

  const handleLogout = () => {
    if (unsubscriber) {
      unsubscriber();
    }
    if (studentData.studentId) {
      firebaseService.logoutStudent(studentData.studentId);
    }
    onLogout();
  };

  const mockBusStops = [
    { name: 'Main Gate', lat: 11.0168, lng: 76.9558 },
    { name: 'Library Stop', lat: 11.0178, lng: 76.9568 },
    { name: 'Hostel Block', lat: 11.0188, lng: 76.9578 },
    { name: 'Academic Block', lat: 11.0198, lng: 76.9588 }
  ];

  // Simulate moving bus location
  const [mockBusLocation, setMockBusLocation] = useState({
    lat: 11.0168,
    lng: 76.9558,
    speed: 25
  });

  useEffect(() => {
    // Simulate bus movement every 3 seconds
    const locationInterval = setInterval(() => {
      setMockBusLocation(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001,
        speed: Math.floor(Math.random() * 40) + 10
      }));
    }, 3000);

    return () => clearInterval(locationInterval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Student Dashboard" 
        userRole="student" 
        userName={studentData.name}
        onLogout={handleLogout} 
      />

      {notification && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 mx-4 mt-4 rounded-lg flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>{notification}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bus Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Bus Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Bus Number:</span>
                  <span className="font-semibold text-blue-600">{studentData.busNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Driver:</span>
                  <span className="font-semibold">{driverName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Route:</span>
                  <span className="font-semibold">Main Campus Route</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Navigation className="h-5 w-5 mr-2 text-green-600" />
                Live Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Speed:</span>
                  <span className="font-semibold text-green-600 animate-pulse">{mockBusLocation.speed} km/h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-green-600 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    On Route
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ETA:</span>
                  <span className="font-semibold">5 mins</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Today's Attendance
              </h3>
              <div className="text-center">
                {attendanceMarked ? (
                  <div className="text-green-600">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                    <p className="font-semibold">Marked Present</p>
                    <p className="text-sm text-gray-600">
                      {currentTime.toLocaleTimeString()}
                    </p>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <Clock className="h-12 w-12 mx-auto mb-2" />
                    <p>Not marked yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-red-600" />
                Live Bus Location - {studentData.busNumber}
              </h3>
              <GoogleMap
                center={mockBusLocation}
                busLocation={mockBusLocation}
                busStops={mockBusStops}
                className="h-96 w-full"
              />
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-900">Live Bus Location</span>
                  </div>
                  <p className="text-xs text-blue-700">Updates every 3 seconds</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span className="text-sm font-medium text-green-900">Bus Stops</span>
                  </div>
                  <p className="text-xs text-green-700">Numbered route stops</p>
                </div>
              </div>
              
              {/* Live tracking info */}
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium text-gray-900">{currentTime.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">GPS Status:</span>
                  <span className="font-medium text-green-600 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;