import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/authService';

const StockManagement = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (currentUser.user.role !== 'admin') {
      navigate('/dashboard');
      toast.error('Admin access required');
      return;
    }
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Stock Management</h1>
          <Link 
            to="/admin" 
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-200"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/admin/stock/inventory"
              className="block bg-blue-50 p-6 rounded-lg border border-blue-100 hover:bg-blue-100 transition duration-200"
            >
              <h3 className="text-xl font-medium text-blue-700 mb-3">Inventory Management</h3>
              <p className="text-sm text-blue-600 mb-4">Track, add, edit, or delete stock items</p>
              <div className="flex justify-end">
                <span className="text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
            
            <Link
              to="/admin/stock/suppliers"
              className="block bg-green-50 p-6 rounded-lg border border-green-100 hover:bg-green-100 transition duration-200"
            >
              <h3 className="text-xl font-medium text-green-700 mb-3">Supplier Management</h3>
              <p className="text-sm text-green-600 mb-4">Manage your product suppliers</p>
              <div className="flex justify-end">
                <span className="text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
            
            <Link
              to="/admin/stock/reports"
              className="block bg-amber-50 p-6 rounded-lg border border-amber-100 hover:bg-amber-100 transition duration-200"
            >
              <h3 className="text-xl font-medium text-amber-700 mb-3">Stock Reports</h3>
              <p className="text-sm text-amber-600 mb-4">Generate and view inventory reports</p>
              <div className="flex justify-end">
                <span className="text-amber-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
            
            <Link
              to="/admin"
              className="block bg-gray-50 p-6 rounded-lg border border-gray-100 hover:bg-gray-100 transition duration-200"
            >
              <h3 className="text-xl font-medium text-gray-700 mb-3">Return to Dashboard</h3>
              <p className="text-sm text-gray-600 mb-4">Go back to the admin dashboard</p>
              <div className="flex justify-end">
                <span className="text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockManagement; 