import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUserCircle, FaEnvelope, FaIdCard, FaCalendarAlt, FaKey, FaUserEdit, FaArrowLeft, FaSignOutAlt, FaPhone } from 'react-icons/fa';
import authService from '../services/authService';
import './userProfile.css';

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      setUser(currentUser.user);
      setFormData({
        name: currentUser.user.name || '',
        email: currentUser.user.email || '',
        phone: currentUser.user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      toast.error('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
    toast.info('Logged out successfully');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      // Call API to update profile
      await authService.updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      });
      
      // Update the user in local storage
      const currentUser = authService.getCurrentUser();
      const updatedUser = {
        ...currentUser,
        user: {
          ...currentUser.user,
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        }
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser.user);
      
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    const { currentPassword, newPassword, confirmPassword } = formData;
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password should be at least 6 characters');
      return;
    }

    // Show loading state
    toast.info('Changing password...', { autoClose: 1000 });
    
    try {
      // Log debugging information
      console.log('Starting password change process');
      
      // Get the token directly from localStorage to ensure it's fresh
      const userString = localStorage.getItem('user');
      if (!userString) {
        toast.error('You need to be logged in to change your password');
        navigate('/login');
        return;
      }
      
      // Debug token information
      const userData = JSON.parse(userString);
      console.log('User data structure from localStorage:', Object.keys(userData));
      if (userData.token) {
        console.log('Token exists directly at userData.token');
        console.log('Token first 10 chars:', userData.token.substring(0, 10));
      } 
      if (userData.user) {
        console.log('User object exists with keys:', Object.keys(userData.user));
      }
      
      // Call API to change password with explicit logging
      console.log('Calling changePassword API with:', {
        currentPasswordLength: currentPassword.length,
        newPasswordLength: newPassword.length
      });
      
      const response = await authService.changePassword({
        currentPassword,
        newPassword
      });
      
      // Reset password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success(response.msg || 'Password changed successfully');
    } catch (error) {
      console.error('Password change error in component:', error);
      
      // Detailed error logging
      if (error.response) {
        // Server responded with error
        console.error('Server response error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        
        // Show appropriate error message based on status code
        if (error.response.status === 401) {
          toast.error('Authentication failed. Please log in again.');
          // Optionally force logout on auth failure
          setTimeout(() => {
            authService.logout();
            navigate('/login');
          }, 2000);
        } else if (error.response.status === 400) {
          toast.error(error.response.data.msg || 'Current password is incorrect');
        } else {
          toast.error(error.response.data.msg || 'Failed to change password. Please try again.');
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        toast.error('Server not responding. Please try again later.');
      } else {
        // Something else happened
        console.error('Error details:', error.message);
        toast.error('An error occurred. Please try again.');
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        // Show loading state
        toast.info('Deleting account...', { autoClose: 1000 });
        
        // Log debugging information
        console.log('Starting account deletion process');
        
        // Get the token directly from localStorage to ensure it's fresh
        const userString = localStorage.getItem('user');
        if (!userString) {
          toast.error('You need to be logged in to delete your account');
          navigate('/login');
          return;
        }
        
        // Debug token information
        const userData = JSON.parse(userString);
        console.log('User data structure:', Object.keys(userData));
        if (userData.token) {
          console.log('Token exists in userData.token');
        } else if (userData.user) {
          console.log('User object exists with keys:', Object.keys(userData.user));
        }
        
        // Call API to delete account
        console.log('Calling deleteAccount API...');
        const response = await authService.deleteAccount();
        
        // Log successful response
        console.log('Account deleted successfully:', response);
        
        // Logout and redirect
        authService.logout();
        navigate('/login');
        toast.success(response.msg || 'Your account has been deleted successfully');
      } catch (error) {
        console.error('Delete account error in component:', error);
        
        // Detailed error logging
        if (error.response) {
          // Server responded with error
          console.error('Server response error:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          });
          
          // Show appropriate error message based on status code
          if (error.response.status === 401) {
            toast.error('Authentication failed. Please log in again.');
            // Force logout on auth failure
            setTimeout(() => {
              authService.logout();
              navigate('/login');
            }, 2000);
          } else {
            toast.error(error.response.data?.msg || 'Failed to delete your account. Please try again.');
          }
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
          toast.error('Server not responding. Please try again later.');
        } else {
          // Something else happened
          console.error('Error details:', error.message);
          toast.error('An error occurred. Please try again.');
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
          
          <h1 className="text-2xl font-bold text-center text-gray-800">My Profile</h1>
          
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-gray-800"
            title="Sign Out"
          >
            <FaSignOutAlt />
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Card */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden profile-card">
              <div className="h-24 bg-gradient-to-r from-green-500 to-green-700"></div>
              <div className="relative px-4 pb-6">
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                  <div className="rounded-full bg-white p-2 shadow-md">
                    <FaUserCircle size={80} className="text-green-700" />
                  </div>
                </div>
                
                <div className="profile-info mt-20 text-center">
                  <h3 className="profile-name text-xl font-bold text-gray-800 mt-5 mb-2">
                    {user?.name || "User"}
                  </h3>
                  <p className="profile-email text-gray-600 mb-1">{user?.email}</p>
                  {user?.phone && <p className="profile-phone text-gray-600 mb-3"><FaPhone className="inline mr-1" size={12} /> {user.phone}</p>}
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    {user?.role || "user"}
                  </span>
                  
                  {/* User ID and Joined date temporarily hidden
                  <div className="flex justify-around mt-6 text-gray-500 text-sm">
                    <div className="text-center">
                      <FaIdCard className="mx-auto mb-1 text-green-600" />
                      <p>User ID</p>
                      <p className="font-medium text-gray-700">{user?._id?.substring(0, 8) || 'N/A'}</p>
                    </div>
                    <div className="text-center">
                      <FaCalendarAlt className="mx-auto mb-1 text-green-600" />
                      <p>Joined</p>
                      <p className="font-medium text-gray-700">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  */}
                </div>
              </div>
              
              <div className="px-4 py-4 border-t border-gray-100">
                <button
                  onClick={handleDeleteAccount}
                  className="w-full py-2 px-4 border border-red-500 text-red-500 rounded hover:bg-red-50 transition duration-200 flex items-center justify-center"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
          
          {/* Tabs Section */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button
                    className={`px-6 py-4 text-sm font-medium ${
                      activeTab === 'profile'
                        ? 'border-b-2 border-green-500 text-green-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <FaUserEdit className="inline mr-2" /> Profile Settings
                  </button>
                  <button
                    className={`px-6 py-4 text-sm font-medium ${
                      activeTab === 'security'
                        ? 'border-b-2 border-green-500 text-green-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('security')}
                  >
                    <FaKey className="inline mr-2" /> Security
                  </button>
                </nav>
              </div>
              
              <div className="p-6">
                {/* Profile Edit Form */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleUpdateProfile}>
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaEnvelope className="text-green-600" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}
                
                {/* Password Change Form */}
                {activeTab === 'security' && (
                  <form onSubmit={handleChangePassword}>
                    <div className="mb-4">
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        required
                        minLength={6}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Password must be at least 6 characters long
                      </p>
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        Change Password
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 