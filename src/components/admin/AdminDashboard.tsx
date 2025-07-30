import React, { useState, useEffect } from 'react';
import { Users, Bus, UserCheck, Plus, Edit, Trash2, MapPin, Eye, UserX } from 'lucide-react';
import Header from '../Header';
import { Student, Driver, Bus as BusType } from '../../types';
import { firebaseService } from '../../services/firebaseService';

interface AdminDashboardProps {
  adminData: { username: string };
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminData, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'drivers' | 'buses' | 'live'>('overview');
  const [students, setStudents] = useState<Student[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [buses, setBuses] = useState<BusType[]>([]);
  const [onlineStudents, setOnlineStudents] = useState<Student[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'student' | 'driver' | 'bus'>('student');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [unsubscribers, setUnsubscribers] = useState<(() => void)[]>([]);

  useEffect(() => {
    console.log('🔄 Admin Dashboard: Setting up subscriptions...');
    
    // Set up real-time subscriptions
    const studentsUnsub = firebaseService.subscribeToStudents(setStudents);
    const driversUnsub = firebaseService.subscribeToDrivers(setDrivers);
    const busesUnsub = firebaseService.subscribeToBuses(setBuses);
    const onlineUnsub = firebaseService.subscribeToOnlineStudents(setOnlineStudents);
    
    const unsubs = [studentsUnsub, driversUnsub, busesUnsub, onlineUnsub];
    setUnsubscribers(unsubs);
    
    console.log('✅ Admin Dashboard: All subscriptions set up');
    
    return () => {
      console.log('🧹 Admin Dashboard: Cleaning up subscriptions');
      unsubs.forEach(unsub => unsub());
    };
  }, []);

  const openModal = (type: 'student' | 'driver' | 'bus', item?: any) => {
    setModalType(type);
    setEditingItem(item || null);
    
    if (type === 'student') {
      setFormData(item || { name: '', email: '', busNumber: '', stopName: '' });
    } else if (type === 'driver') {
      setFormData(item || { name: '', email: '', busNumber: '', phone: '', isActive: true });
    } else if (type === 'bus') {
      setFormData(item || { busNumber: '', driverId: '', isActive: true });
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('💾 Admin: Saving data...', { modalType, formData });
    
    try {
      if (modalType === 'student') {
        if (editingItem) {
          await firebaseService.updateStudent(editingItem.id, formData);
        } else {
          await firebaseService.createStudent(formData);
        }
      } else if (modalType === 'driver') {
        if (editingItem) {
          await firebaseService.updateDriver(editingItem.id, formData);
        } else {
          await firebaseService.createDriver(formData);
        }
      } else if (modalType === 'bus') {
        // Find driver name for bus assignment
        const driver = drivers.find(d => d.id === formData.driverId);
        const busData = {
          ...formData,
          driverName: driver?.name || '',
          route: [],
          currentLocation: null
        };
        
        if (editingItem) {
          await firebaseService.updateBus(editingItem.id, busData);
        } else {
          await firebaseService.createBus(busData);
        }
      }
      
      closeModal();
      console.log('✅ Admin: Data saved successfully');
      // Data will update automatically via real-time subscriptions
    } catch (error) {
      console.error('❌ Admin: Error saving data:', error);
      alert('Failed to save data. Please try again.');
    }
  };

  const handleDelete = async (type: 'student' | 'driver' | 'bus', id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      if (type === 'student') {
        await firebaseService.deleteStudent(id);
      } else if (type === 'driver') {
        await firebaseService.deleteDriver(id);
      } else if (type === 'bus') {
        await firebaseService.deleteBus(id);
      }
      // Data will update automatically via real-time subscriptions
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: MapPin },
    { id: 'live', label: 'Live Students', icon: Eye },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'drivers', label: 'Drivers', icon: UserCheck },
    { id: 'buses', label: 'Buses', icon: Bus }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Admin Portal" 
        userRole="admin" 
        userName={adminData.username}
        onLogout={onLogout} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{tab.label}</span>
                    {tab.id === 'live' && onlineStudents.length > 0 && (
                      <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 ml-1">
                        {onlineStudents.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Total Students</h3>
                  <p className="text-3xl font-bold text-blue-600">{students.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <Eye className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Online Now</h3>
                  <p className="text-3xl font-bold text-green-600">{onlineStudents.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <UserCheck className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Active Drivers</h3>
                  <p className="text-3xl font-bold text-purple-600">{drivers.filter(d => d.isActive).length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100">
                  <Bus className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Total Buses</h3>
                  <p className="text-3xl font-bold text-orange-600">{buses.length}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Overview Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Current Online Students */}
            <div className="bg-white rounded-xl shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-green-600" />
                  Currently Online Students
                </h3>
              </div>
              <div className="p-6">
                {onlineStudents.length > 0 ? (
                  <div className="space-y-3">
                    {onlineStudents.slice(0, 5).map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">Bus: {student.busNumber}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-600 font-medium">Online</span>
                        </div>
                      </div>
                    ))}
                    {onlineStudents.length > 5 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{onlineStudents.length - 5} more students online
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserX className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500">No students currently online</p>
                  </div>
                )}
              </div>
            </div>

            {/* Active Buses */}
            <div className="bg-white rounded-xl shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Bus className="h-5 w-5 mr-2 text-orange-600" />
                  Active Buses & Drivers
                </h3>
              </div>
              <div className="p-6">
                {buses.filter(bus => bus.isActive).length > 0 ? (
                  <div className="space-y-3">
                    {buses.filter(bus => bus.isActive).map((bus) => (
                      <div key={bus.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{bus.busNumber}</p>
                          <p className="text-sm text-gray-600">Driver: {bus.driverName || 'Not Assigned'}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-xs text-orange-600 font-medium">Active</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bus className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500">No active buses</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          </>
        )}

        {/* Live Students Tab */}
        {activeTab === 'live' && (
          <div className="bg-white rounded-xl shadow-md">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Eye className="h-6 w-6 mr-2 text-green-600" />
                Live Students ({onlineStudents.length})
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">Live Updates</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bus Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stop Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {onlineStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.busNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.stopName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.lastLogin ? new Date(student.lastLogin.seconds * 1000).toLocaleTimeString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                          Online
                        </span>
                      </td>
                    </tr>
                  ))}
                  {onlineStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        <UserX className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        No students are currently online
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-xl shadow-md">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Students Management</h2>
              <button
                onClick={() => openModal('student')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Student</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bus Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stop Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.busNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.stopName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.isOnline 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {student.isOnline ? (
                            <>
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                              Online
                            </>
                          ) : 'Offline'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => openModal('student', student)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('student', student.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Drivers Tab */}
        {activeTab === 'drivers' && (
          <div className="bg-white rounded-xl shadow-md">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Drivers Management</h2>
              <button
                onClick={() => openModal('driver')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Driver</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bus Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {drivers.map((driver) => (
                    <tr key={driver.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{driver.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.busNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          driver.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {driver.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => openModal('driver', driver)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('driver', driver.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Buses Tab */}
        {activeTab === 'buses' && (
          <div className="bg-white rounded-xl shadow-md">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Buses Management</h2>
              <button
                onClick={() => openModal('bus')}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Bus</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bus Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {buses.map((bus) => (
                    <tr key={bus.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bus.busNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bus.driverName || 'Not Assigned'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          bus.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {bus.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bus.currentLocation 
                          ? `${bus.currentLocation.lat.toFixed(4)}, ${bus.currentLocation.lng.toFixed(4)}`
                          : 'No location data'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => openModal('bus', bus)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('bus', bus.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingItem ? 'Edit' : 'Add'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {modalType === 'student' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bus Number</label>
                      <input
                        type="text"
                        required
                        value={formData.busNumber || ''}
                        onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Stop Name</label>
                      <input
                        type="text"
                        required
                        value={formData.stopName || ''}
                        onChange={(e) => setFormData({ ...formData, stopName: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </>
                )}

                {modalType === 'driver' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bus Number</label>
                      <input
                        type="text"
                        required
                        value={formData.busNumber || ''}
                        onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isActive || false}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active Driver</span>
                      </label>
                    </div>
                  </>
                )}

                {modalType === 'bus' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bus Number</label>
                      <input
                        type="text"
                        required
                        value={formData.busNumber || ''}
                        onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Assign Driver</label>
                      <select
                        required
                        value={formData.driverId || ''}
                        onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="">Select Driver</option>
                        {drivers.map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.name} ({driver.phone})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isActive || false}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active Bus</span>
                      </label>
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      modalType === 'student' 
                        ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                        : modalType === 'driver'
                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                        : 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
                    }`}
                  >
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;