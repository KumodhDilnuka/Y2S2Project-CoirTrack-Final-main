import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/authService';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user and check admin status
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
    
    setUser(currentUser.user);
    
    // Set auth header for API calls
    authService.setAuthHeader();
    
    // Fetch all users
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const users = await authService.getAllUsers();
      setUsers(users);
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching users');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
    toast.info('Logged out successfully');
  };

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onCreateAdmin = async (e) => {
    e.preventDefault();
    
    const { name, email, password, confirmPassword } = formData;
    
    // Simple validation
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password should be at least 6 characters');
      return;
    }
    
    try {
      // Create admin user
      const { confirmPassword, ...adminData } = formData;
      await authService.createAdmin(adminData);
      
      // Reset form and refresh user list
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      setShowCreateAdmin(false);
      fetchUsers();
      
      toast.success('Admin user created successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.msg || 'Failed to create admin user';
      toast.error(errorMessage);
    }
  };

  if (!user || loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
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
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-base font-medium capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Link
            to="/itemsshow"
            className="block bg-blue-50 p-4 rounded-lg border border-blue-100 hover:bg-blue-100 transition duration-200"
          >
            <h3 className="text-lg font-medium text-blue-700 mb-2">Manage Items</h3>
            <p className="text-sm text-blue-600">Add, edit, or delete store items</p>
          </Link>
          
          <Link
            to="/admin/orders"
            className="block bg-amber-50 p-4 rounded-lg border border-amber-100 hover:bg-amber-100 transition duration-200"
          >
            <h3 className="text-lg font-medium text-amber-700 mb-2">Approve Orders</h3>
            <p className="text-sm text-amber-600">Review and approve customer orders</p>
          </Link>
          
          <Link
            to="/paymnetHistory"
            className="block bg-purple-50 p-4 rounded-lg border border-purple-100 hover:bg-purple-100 transition duration-200"
          >
            <h3 className="text-lg font-medium text-purple-700 mb-2">Order History</h3>
            <p className="text-sm text-purple-600">View and manage customer orders</p>
          </Link>
          
          <Link
            to="/admin/feedback"
            className="block bg-green-50 p-4 rounded-lg border border-green-100 hover:bg-green-100 transition duration-200"
          >
            <h3 className="text-lg font-medium text-green-700 mb-2">Manage Feedback</h3>
            <p className="text-sm text-green-600">View and manage customer feedback</p>
          </Link>
          
          <Link
            to="/admin/inquiries"
            className="block bg-indigo-50 p-4 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition duration-200"
          >
            <h3 className="text-lg font-medium text-indigo-700 mb-2">Manage Inquiries</h3>
            <p className="text-sm text-indigo-600">Respond to customer inquiries</p>
          </Link>
          
          <Link
            to="/admin/stock"
            className="block bg-rose-50 p-4 rounded-lg border border-rose-100 hover:bg-rose-100 transition duration-200"
          >
            <h3 className="text-lg font-medium text-rose-700 mb-2">Stock Management</h3>
            <p className="text-sm text-rose-600">Manage inventory and suppliers</p>
          </Link>
          
          <Link
            to="/admin/users"
            className="block bg-teal-50 p-4 rounded-lg border border-teal-100 hover:bg-teal-100 transition duration-200"
          >
            <h3 className="text-lg font-medium text-teal-700 mb-2">User Management</h3>
            <p className="text-sm text-teal-600">Manage users, profiles and permissions</p>
          </Link>
          
          <div 
            className="block bg-gray-50 p-4 rounded-lg border border-gray-100 hover:bg-gray-100 transition duration-200 cursor-pointer"
            onClick={() => setShowCreateAdmin(!showCreateAdmin)}
          >
            <h3 className="text-lg font-medium text-gray-700 mb-2">Create Admin</h3>
            <p className="text-sm text-gray-600">Add another administrator to the system</p>
          </div>
        </div>
        
        {/* Create Admin Form */}
        {showCreateAdmin && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4">Create New Admin</h2>
            <form onSubmit={onCreateAdmin}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.name}
                    onChange={onChange}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.email}
                    onChange={onChange}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.password}
                    onChange={onChange}
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.confirmPassword}
                    onChange={onChange}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded mr-2 hover:bg-gray-300 transition duration-200"
                  onClick={() => setShowCreateAdmin(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* User Management */}
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 