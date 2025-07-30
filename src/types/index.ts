export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'driver' | 'admin';
  busNumber?: string;
  stopName?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  busNumber: string;
  stopName: string;
  attendance: AttendanceRecord[];
  isOnline?: boolean;
  lastLogin?: any;
  lastLogout?: any;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  busNumber: string;
  phone: string;
  isActive: boolean;
}

export interface Bus {
  id: string;
  busNumber: string;
  driverId?: string;
  driverName?: string;
  currentLocation?: {
    lat: number;
    lng: number;
    timestamp: number;
    speed?: number;
  };
  route: BusStop[];
  isActive: boolean;
}

export interface BusStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
}

export interface AttendanceRecord {
  date: string;
  timestamp: number;
  busNumber: string;
}