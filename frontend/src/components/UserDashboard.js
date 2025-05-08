import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/authService';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user from auth service
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    setUser(currentUser.user);
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
    toast.info('Logged out successfully');
  };

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">User Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200"
          >
            Log out
          </button>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user.name}!</h2>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Your Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-base font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-base font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Type</p>
                <p className="text-base font-medium capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Link
            to="/shops"
            className="block bg-blue-50 p-4 rounded-lg border border-blue-100 hover:bg-blue-100 transition duration-200"
          >
            <h3 className="text-lg font-medium text-blue-700 mb-2">Shop</h3>
            <p className="text-sm text-blue-600">Browse and purchase items from our shop</p>
          </Link>
          
          <Link
            to="/paymnetHistory"
            className="block bg-purple-50 p-4 rounded-lg border border-purple-100 hover:bg-purple-100 transition duration-200"
          >
            <h3 className="text-lg font-medium text-purple-700 mb-2">Order History</h3>
            <p className="text-sm text-purple-600">View your previous orders and their status</p>
          </Link>
          
          <Link
            to="/inquiry"
            className="block bg-amber-50 p-4 rounded-lg border border-amber-100 hover:bg-amber-100 transition duration-200"
          >
            <h3 className="text-lg font-medium text-amber-700 mb-2">My Inquiries</h3>
            <p className="text-sm text-amber-600">View and manage your inquiries and responses</p>
          </Link>

          <Link
            to="/contact"
            className="block bg-indigo-50 p-4 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition duration-200"
          >
            <h3 className="text-lg font-medium text-indigo-700 mb-2">Contact Us</h3>
            <p className="text-sm text-indigo-600">Get in touch with our customer support team</p>
          </Link>
          
          <Link
            to="/aboutUs"
            className="block bg-green-50 p-4 rounded-lg border border-green-100 hover:bg-green-100 transition duration-200"
          >
            <h3 className="text-lg font-medium text-green-700 mb-2">About Us</h3>
            <p className="text-sm text-green-600">Learn more about our company and services</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 