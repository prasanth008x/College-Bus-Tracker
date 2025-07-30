import React from 'react';
import { Bus, LogOut } from 'lucide-react';

interface HeaderProps {
  title: string;
  userRole: string;
  userName?: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, userRole, userName, onLogout }) => {
  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Bus className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">VSB College</h1>
                <p className="text-sm text-gray-600">Bus Tracking System</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{title}</p>
              <p className="text-xs text-gray-600 capitalize">{userRole} {userName && `- ${userName}`}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;