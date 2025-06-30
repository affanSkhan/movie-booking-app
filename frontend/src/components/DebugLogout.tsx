import React from 'react';
import { useAuth } from '../contexts/AuthContextInstance';

const DebugLogout: React.FC = () => {
  const { user, logout } = useAuth();

  const handleTestLogout = () => {
    console.log('🔍 Debug: Before logout');
    console.log('User:', user);
    console.log('Token in localStorage:', localStorage.getItem('token'));
    console.log('User in localStorage:', localStorage.getItem('user'));
    
    logout();
    
    console.log('🔍 Debug: After logout');
    console.log('User:', user);
    console.log('Token in localStorage:', localStorage.getItem('token'));
    console.log('User in localStorage:', localStorage.getItem('user'));
  };

  return (
    <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Debug Logout</h3>
      <p className="mb-2">Current user: {user ? user.name : 'None'}</p>
      <p className="mb-2">Token exists: {localStorage.getItem('token') ? 'Yes' : 'No'}</p>
      <button 
        onClick={handleTestLogout}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Test Logout
      </button>
    </div>
  );
};

export default DebugLogout; 