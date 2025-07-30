import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Student, Driver, Bus, AttendanceRecord } from '../types';

export class FirebaseService {
  private listeners: (() => void)[] = [];

  // Test Firebase connection
  async testConnection(): Promise<boolean> {
    try {
      const testDoc = doc(db, 'test', 'connection');
      await setDoc(testDoc, { timestamp: serverTimestamp() });
      console.log('✅ Firebase connection successful');
      return true;
    } catch (error) {
      console.error('❌ Firebase connection failed:', error);
      return false;
    }
  }

  // Student operations
  async createStudent(studentData: Omit<Student, 'id'>): Promise<string> {
    try {
      console.log('Creating student:', studentData);
      const docRef = await addDoc(collection(db, 'students'), {
        ...studentData,
        createdAt: serverTimestamp(),
        isOnline: true,
        lastLogin: serverTimestamp(),
        attendance: []
      });
      console.log('✅ Student created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating student:', error);
      throw error;
    }
  }

  async getStudent(id: string): Promise<Student | null> {
    try {
      const docSnap = await getDoc(doc(db, 'students', id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Student;
      }
      return null;
    } catch (error) {
      console.error('Error getting student:', error);
      return null;
    }
  }

  async loginStudent(name: string, busNumber: string): Promise<string> {
    try {
      console.log('🔄 Attempting student login:', { name, busNumber });
      
      // Check if student already exists
      const q = query(
        collection(db, 'students'), 
        where('name', '==', name), 
        where('busNumber', '==', busNumber)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Student exists, update their status
        const studentDoc = querySnapshot.docs[0];
        const studentId = studentDoc.id;
        
        await updateDoc(doc(db, 'students', studentId), {
          isOnline: true,
          lastLogin: serverTimestamp()
        });
        
        // Mark attendance
        await this.markAttendance(studentId, busNumber);
        console.log('✅ Existing student logged in:', studentId);
        return studentId;
      } else {
        // Create new student
        const newStudentData = {
          name,
          email: `${name.toLowerCase().replace(/\s+/g, '.')}@vsb.edu.in`,
          busNumber,
          stopName: 'Main Gate',
          attendance: [],
          isOnline: true,
          lastLogin: serverTimestamp()
        };
        
        const studentId = await this.createStudent(newStudentData);
        await this.markAttendance(studentId, busNumber);
        console.log('✅ New student created and logged in:', studentId);
        return studentId;
      }
    } catch (error) {
      console.error('❌ Student login error:', error);
      throw new Error('Failed to login student. Please check your connection.');
    }
  }

  async markAttendance(studentId: string, busNumber: string): Promise<void> {
    try {
      const today = new Date().toDateString();
      const attendanceRecord: AttendanceRecord = {
        date: today,
        timestamp: Date.now(),
        busNumber
      };

      const studentRef = doc(db, 'students', studentId);
      const studentDoc = await getDoc(studentRef);
      
      if (studentDoc.exists()) {
        const student = studentDoc.data() as Student;
        const existingAttendance = student.attendance || [];
        
        // Check if already marked today
        const todayAttendance = existingAttendance.find(record => record.date === today);
        
        if (!todayAttendance) {
          await updateDoc(studentRef, {
            attendance: [...existingAttendance, attendanceRecord],
            lastAttendance: serverTimestamp()
          });
          console.log('✅ Attendance marked for student:', studentId);
        } else {
          console.log('ℹ️ Attendance already marked today for student:', studentId);
        }
      }
    } catch (error) {
      console.error('❌ Error marking attendance:', error);
    }
  }

  async logoutStudent(studentId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'students', studentId), {
        isOnline: false,
        lastLogout: serverTimestamp()
      });
      console.log('✅ Student logged out:', studentId);
    } catch (error) {
      console.error('❌ Error logging out student:', error);
    }
  }

  // Driver operations
  async createDriver(driverData: Omit<Driver, 'id'>): Promise<string> {
    try {
      console.log('Creating driver:', driverData);
      const docRef = await addDoc(collection(db, 'drivers'), {
        ...driverData,
        createdAt: serverTimestamp(),
        isActive: driverData.isActive || true
      });
      console.log('✅ Driver created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating driver:', error);
      throw error;
    }
  }

  async updateDriver(id: string, updates: Partial<Driver>): Promise<void> {
    try {
      await updateDoc(doc(db, 'drivers', id), {
        ...updates,
        lastUpdated: serverTimestamp()
      });
      console.log('✅ Driver updated:', id);
    } catch (error) {
      console.error('❌ Error updating driver:', error);
      throw error;
    }
  }

  async deleteDriver(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'drivers', id));
      console.log('✅ Driver deleted:', id);
    } catch (error) {
      console.error('❌ Error deleting driver:', error);
      throw error;
    }
  }

  // Bus operations
  async createBus(busData: Omit<Bus, 'id'>): Promise<string> {
    try {
      console.log('Creating bus:', busData);
      const docRef = await addDoc(collection(db, 'buses'), {
        ...busData,
        createdAt: serverTimestamp(),
        currentLocation: null,
        route: busData.route || [],
        isActive: busData.isActive || true
      });
      console.log('✅ Bus created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating bus:', error);
      throw error;
    }
  }

  async getBus(busNumber: string): Promise<Bus | null> {
    try {
      const q = query(collection(db, 'buses'), where('busNumber', '==', busNumber));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Bus;
      }
      return null;
    } catch (error) {
      console.error('Error getting bus:', error);
      return null;
    }
  }

  async updateBus(id: string, updates: Partial<Bus>): Promise<void> {
    try {
      await updateDoc(doc(db, 'buses', id), {
        ...updates,
        lastUpdated: serverTimestamp()
      });
      console.log('✅ Bus updated:', id);
    } catch (error) {
      console.error('❌ Error updating bus:', error);
      throw error;
    }
  }

  async deleteBus(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'buses', id));
      console.log('✅ Bus deleted:', id);
    } catch (error) {
      console.error('❌ Error deleting bus:', error);
      throw error;
    }
  }

  async updateBusLocation(busNumber: string, location: { lat: number; lng: number; speed?: number }): Promise<void> {
    try {
      const bus = await this.getBus(busNumber);
      if (bus) {
        await updateDoc(doc(db, 'buses', bus.id), {
          currentLocation: {
            ...location,
            timestamp: Date.now()
          },
          lastUpdated: serverTimestamp()
        });
        console.log('✅ Bus location updated:', busNumber);
      }
    } catch (error) {
      console.error('❌ Error updating bus location:', error);
    }
  }

  // Real-time subscriptions
  subscribeToStudents(callback: (students: Student[]) => void): () => void {
    console.log('🔄 Setting up students subscription...');
    const unsubscribe = onSnapshot(
      collection(db, 'students'),
      (snapshot) => {
        const students = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as Student));
        console.log('📊 Students updated:', students.length);
        callback(students);
      },
      (error) => {
        console.error('❌ Students subscription error:', error);
      }
    );
    
    this.listeners.push(unsubscribe);
    return unsubscribe;
  }

  subscribeToOnlineStudents(callback: (students: Student[]) => void): () => void {
    console.log('🔄 Setting up online students subscription...');
    const q = query(collection(db, 'students'), where('isOnline', '==', true));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const students = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as Student));
        console.log('👥 Online students updated:', students.length);
        callback(students);
      },
      (error) => {
        console.error('❌ Online students subscription error:', error);
      }
    );
    
    this.listeners.push(unsubscribe);
    return unsubscribe;
  }

  subscribeToDrivers(callback: (drivers: Driver[]) => void): () => void {
    console.log('🔄 Setting up drivers subscription...');
    const unsubscribe = onSnapshot(
      collection(db, 'drivers'),
      (snapshot) => {
        const drivers = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as Driver));
        console.log('🚗 Drivers updated:', drivers.length);
        callback(drivers);
      },
      (error) => {
        console.error('❌ Drivers subscription error:', error);
      }
    );
    
    this.listeners.push(unsubscribe);
    return unsubscribe;
  }

  subscribeToBuses(callback: (buses: Bus[]) => void): () => void {
    console.log('🔄 Setting up buses subscription...');
    const unsubscribe = onSnapshot(
      collection(db, 'buses'),
      (snapshot) => {
        const buses = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as Bus));
        console.log('🚌 Buses updated:', buses.length);
        callback(buses);
      },
      (error) => {
        console.error('❌ Buses subscription error:', error);
      }
    );
    
    this.listeners.push(unsubscriber);
    return unsubscribe;
  }

  subscribeToBusLocation(busNumber: string, callback: (bus: Bus | null) => void): () => void {
    console.log('🔄 Setting up bus location subscription for:', busNumber);
    const q = query(collection(db, 'buses'), where('busNumber', '==', busNumber));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const bus = { id: doc.id, ...doc.data() } as Bus;
          console.log('📍 Bus location updated:', busNumber);
          callback(bus);
        } else {
          console.log('❌ Bus not found:', busNumber);
          callback(null);
        }
      },
      (error) => {
        console.error('❌ Bus location subscription error:', error);
      }
    );
    
    this.listeners.push(unsubscribe);
    return unsubscribe;
  }

  // Cleanup
  cleanup(): void {
    console.log('🧹 Cleaning up Firebase listeners...');
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners = [];
  }

  // Get all data (fallback methods)
  async getAllStudents(): Promise<Student[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'students'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
    } catch (error) {
      console.error('Error getting all students:', error);
      return [];
    }
  }

  async getAllDrivers(): Promise<Driver[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'drivers'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Driver));
    } catch (error) {
      console.error('Error getting all drivers:', error);
      return [];
    }
  }

  async getAllBuses(): Promise<Bus[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'buses'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bus));
    } catch (error) {
      console.error('Error getting all buses:', error);
      return [];
    }
  }
}

export const firebaseService = new FirebaseService();