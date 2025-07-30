import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableNetwork, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  // Replace with your actual Firebase config
  apiKey: "AIzaSyDUic0Xc1Gccx7HwBJJh4VtqnVqzUc9FOo",
  authDomain: "vsb-college-bus-tracking.firebaseapp.com",
  projectId: "vsb-college-bus-tracking",
  storageBucket: "vsb-college-bus-tracking.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Enable offline persistence and real-time sync
try {
  enableNetwork(db);
  console.log('Firebase connected successfully');
} catch (error) {
  console.error('Firebase connection error:', error);
}

export default app;