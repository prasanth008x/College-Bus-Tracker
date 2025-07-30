import React, { useState } from 'react';
import RoleSelector from './components/RoleSelector';
import StudentLogin from './components/student/StudentLogin';
import StudentDashboard from './components/student/StudentDashboard';
import DriverLogin from './components/driver/DriverLogin';
import DriverDashboard from './components/driver/DriverDashboard';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';

type AppState = 
  | { screen: 'role-selector' }
  | { screen: 'student-login' }
  | { screen: 'student-dashboard'; data: { name: string; busNumber: string; studentId: string } }
  | { screen: 'driver-login' }
  | { screen: 'driver-dashboard'; data: { name: string; busNumber: string } }
  | { screen: 'admin-login' }
  | { screen: 'admin-dashboard'; data: { username: string } };

function App() {
  const [appState, setAppState] = useState<AppState>({ screen: 'role-selector' });

  const handleRoleSelect = (role: 'student' | 'driver' | 'admin') => {
    setAppState({ screen: `${role}-login` as any });
  };

  const handleBack = () => {
    setAppState({ screen: 'role-selector' });
  };

  const handleLogout = () => {
    setAppState({ screen: 'role-selector' });
  };

  const handleStudentLogin = (studentData: { name: string; busNumber: string; studentId: string }) => {
    setAppState({ screen: 'student-dashboard', data: studentData });
  };

  const handleDriverLogin = (driverData: { name: string; busNumber: string }) => {
    setAppState({ screen: 'driver-dashboard', data: driverData });
  };

  const handleAdminLogin = (adminData: { username: string }) => {
    setAppState({ screen: 'admin-dashboard', data: adminData });
  };

  switch (appState.screen) {
    case 'role-selector':
      return <RoleSelector onRoleSelect={handleRoleSelect} />;
    
    case 'student-login':
      return <StudentLogin onLogin={handleStudentLogin} onBack={handleBack} />;
    
    case 'student-dashboard':
      return <StudentDashboard studentData={appState.data} onLogout={handleLogout} />;
    
    case 'driver-login':
      return <DriverLogin onLogin={handleDriverLogin} onBack={handleBack} />;
    
    case 'driver-dashboard':
      return <DriverDashboard driverData={appState.data} onLogout={handleLogout} />;
    
    case 'admin-login':
      return <AdminLogin onLogin={handleAdminLogin} onBack={handleBack} />;
    
    case 'admin-dashboard':
      return <AdminDashboard adminData={appState.data} onLogout={handleLogout} />;
    
    default:
      return <RoleSelector onRoleSelect={handleRoleSelect} />;
  }
}

export default App;