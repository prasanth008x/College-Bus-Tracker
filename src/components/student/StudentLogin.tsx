import React, { useState, useEffect } from 'react';
import { Bus, LogIn, User, AlertCircle, CheckCircle } from 'lucide-react';
import { firebaseService } from '../../services/firebaseService';

interface StudentLoginProps {
  onLogin: (studentData: { name: string; busNumber: string; studentId: string }) => void;
  onBack: () => void;
}

const StudentLogin: React.FC<StudentLoginProps> = ({ onLogin, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    busNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');

  useEffect(() => {
    // Test Firebase connection on component mount
    const testConnection = async () => {
      try {
        const isConnected = await firebaseService.testConnection();
        setConnectionStatus(isConnected ? 'connected' : 'failed');
      } catch (error) {
        console.error('Connection test failed:', error);
        setConnectionStatus('failed');
      }
    };

    testConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.busNumber.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('🔄 Starting student login process...');
      
      // Login student and get ID
      const studentId = await firebaseService.loginStudent(
        formData.name.trim(), 
        formData.busNumber.trim().toUpperCase()
      );
      
      setSuccess('✅ Login successful! Attendance marked.');
      
      // Wait a moment to show success message
      setTimeout(() => {
        onLogin({
          name: formData.name.trim(),
          busNumber: formData.busNumber.trim().toUpperCase(),
          studentId: studentId
        });
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setError(error.message || 'Login failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Bus className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Student Login</h2>
          <p className="text-gray-600 mt-2">Enter your details to track your bus</p>
          
          {/* Connection Status */}
          <div className="mt-4 flex items-center justify-center space-x-2">
            {connectionStatus === 'checking' && (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Connecting to server...</span>
              </>
            )}
            {connectionStatus === 'connected' && (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Connected to server</span>
              </>
            )}
            {connectionStatus === 'failed' && (
              <>
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">Connection failed</span>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Your Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your full name"
              disabled={isLoading || connectionStatus === 'failed'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Bus className="h-4 w-4 inline mr-2" />
              Bus Number
            </label>
            <input
              type="text"
              required
              value={formData.busNumber}
              onChange={(e) => setFormData({ ...formData, busNumber: e.target.value.toUpperCase() })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="e.g., VSB-001"
              disabled={isLoading || connectionStatus === 'failed'}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || connectionStatus !== 'connected'}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                <span>Login & Mark Attendance</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 text-center">
            <strong>Instructions:</strong><br />
            1. Enter your full name<br />
            2. Enter your bus number (e.g., VSB-001)<br />
            3. Your attendance will be marked automatically<br />
            4. You'll see live bus location after login
          </p>
        </div>

        <button
          onClick={onBack}
          disabled={isLoading}
          className="w-full mt-4 text-gray-600 hover:text-gray-800 py-2 text-center transition-colors disabled:opacity-50"
        >
          ← Back to role selection
        </button>
      </div>
    </div>
  );
};

export default StudentLogin;