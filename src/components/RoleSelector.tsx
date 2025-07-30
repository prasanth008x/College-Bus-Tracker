import React from 'react';
import { Users, UserCheck, Shield, Bus } from 'lucide-react';

interface RoleSelectorProps {
  onRoleSelect: (role: 'student' | 'driver' | 'admin') => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ onRoleSelect }) => {
  const roles = [
    {
      id: 'student' as const,
      title: 'Student Login',
      description: 'Track your bus and mark attendance',
      icon: Users,
      color: 'blue'
    },
    {
      id: 'driver' as const,
      title: 'Driver Login',
      description: 'Start tracking and manage your route',
      icon: UserCheck,
      color: 'green'
    },
    {
      id: 'admin' as const,
      title: 'Admin Portal',
      description: 'Manage buses, drivers, and students',
      icon: Shield,
      color: 'orange'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Bus className="h-16 w-16 text-blue-600 mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">VSB College</h1>
              <p className="text-xl text-gray-600 mt-2">Bus Tracking System</p>
            </div>
          </div>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Real-time bus tracking, attendance management, and route optimization for a smarter campus transportation experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {roles.map((role) => {
            const IconComponent = role.icon;
            const colorClasses = {
              blue: 'bg-blue-600 hover:bg-blue-700 border-blue-200',
              green: 'bg-green-600 hover:bg-green-700 border-green-200',
              orange: 'bg-orange-600 hover:bg-orange-700 border-orange-200'
            };

            return (
              <div
                key={role.id}
                onClick={() => onRoleSelect(role.id)}
                className="bg-white rounded-xl shadow-lg border-2 border-gray-100 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              >
                <div className="p-8 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${colorClasses[role.color]} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{role.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{role.description}</p>
                </div>
                <div className={`h-2 ${colorClasses[role.color]} rounded-b-xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div>✓ Live GPS Tracking</div>
              <div>✓ Auto Attendance</div>
              <div>✓ Real-time Notifications</div>
              <div>✓ Route Management</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;