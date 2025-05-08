import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Register user
const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData);
  
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

// Get current user
const getCurrentUser = () => {
  const userString = localStorage.getItem('user');
  console.log("User string from localStorage:", userString);
  
  if (!userString) {
    return null;
  }
  
  try {
    const user = JSON.parse(userString);
    console.log("Parsed user object:", user);
    return user;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return null;
  }
};

// Check if user is logged in
const isLoggedIn = () => {
  return localStorage.getItem('user') !== null;
};

// Check if user is admin
const isAdmin = () => {
  const user = getCurrentUser();
  const isAdminUser = user && user.user && user.user.role === 'admin';
  console.log("Is admin check:", isAdminUser, user);
  return isAdminUser;
};

// Get auth token
const getToken = () => {
  const user = getCurrentUser();
  if (!user) {
    console.log("getToken: No user found in localStorage");
    return null;
  }
  
  // Debug the user object structure completely
  console.log("User object structure for token retrieval:", 
    Object.keys(user).join(', '));
  
  // Output the full user object structure (sanitized for security)
  const userObj = { ...user };
  if (userObj.token) userObj.token = userObj.token.substring(0, 10) + '...';
  if (userObj.user && userObj.user.token) userObj.user.token = userObj.user.token.substring(0, 10) + '...';
  console.log("Full user object (sanitized):", JSON.stringify(userObj, null, 2));
  
  // Simple definitive token retrieval - look in expected locations
  if (user.token) {
    console.log("Found token at user.token");
    return user.token;
  } 
  
  if (user.user && user.user.token) {
    console.log("Found token at user.user.token");
    return user.user.token;
  }

  // Sometimes the token is just stored directly in the user object
  if (typeof user === 'string') {
    console.log("User object is the token itself (string)");
    return user;
  }
  
  if (user.accessToken) {
    console.log("Found token at user.accessToken");
    return user.accessToken;
  }
  
  // Last resort - user object itself might be the token (unused in this app)
  const userKeys = Object.keys(user);
  if (userKeys.length === 1 && typeof user[userKeys[0]] === 'string') {
    console.log("User object might be the token itself");
    return user[userKeys[0]];
  }
  
  console.log("Failed to find token in user object");
  return null;
};

// Add token to requests
const setAuthHeader = () => {
  const token = getToken();
  console.log('Setting auth header with token:', token ? 'Token exists' : 'No token');
  
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
    // Also set for this specific request
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Auth headers set successfully');
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
    delete axios.defaults.headers.common['Authorization'];
    console.log('Auth headers cleared');
  }
};

// Get all users (admin only)
const getAllUsers = async () => {
  setAuthHeader();
  const response = await axios.get(`${API_URL}/users`);
  return response.data;
};

// Create admin user (admin only)
const createAdmin = async (userData) => {
  setAuthHeader();
  const response = await axios.post(`${API_URL}/create-admin`, userData);
  return response.data;
};

// Update user profile
const updateProfile = async (profileData) => {
  setAuthHeader();
  const response = await axios.put(`${API_URL}/profile`, profileData);
  return response.data;
};

// Change password
const changePassword = async (passwordData) => {
  try {
    // Don't rely on axios defaults, set explicitly for this critical request
    const token = getToken();
    
    if (!token) {
      console.error('No authentication token available. Cannot change password.');
      throw new Error('Authentication token missing');
    }
    
    // Log the password data being sent (without actual passwords)
    console.log('Changing password with data:', { 
      hasCurrentPassword: !!passwordData.currentPassword,
      hasNewPassword: !!passwordData.newPassword,
      currentPasswordLength: passwordData.currentPassword?.length,
      newPasswordLength: passwordData.newPassword?.length
    });
    
    // Use both header formats to ensure compatibility
    const headers = {
      'x-auth-token': token,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('Request headers for password change:', {
      'x-auth-token': token ? token.substring(0, 10) + '...' : null,
      'Authorization': token ? 'Bearer ' + token.substring(0, 10) + '...' : null,
    });
    
    // Make the API call with explicit headers - IMPORTANT: DO NOT use JSON.stringify
    console.log('Sending request to:', `${API_URL}/change-password`);
    const response = await axios({
      method: 'put',
      url: `${API_URL}/change-password`,
      data: passwordData, // Use the object directly, axios will handle serialization
      headers: headers
    });
    
    console.log('Password change response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Password change error full details:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error message:', error.message);
    }
    
    throw error;
  }
};

// Delete account (own account)
const deleteAccount = async () => {
  try {
    // Don't rely on axios defaults, set explicitly for this critical request
    const token = getToken();
    
    if (!token) {
      console.error('No authentication token available. Cannot delete account.');
      throw new Error('Authentication token missing');
    }
    
    console.log('Attempting to delete account...');
    
    // Use both header formats to ensure compatibility
    const headers = {
      'x-auth-token': token,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('Request headers for account deletion:', {
      'x-auth-token': token ? token.substring(0, 10) + '...' : null,
      'Authorization': token ? 'Bearer ' + token.substring(0, 10) + '...' : null,
    });
    
    // Make the API call with explicit headers and configuration
    console.log('Sending request to:', `${API_URL}/delete-account`);
    const response = await axios({
      method: 'delete',
      url: `${API_URL}/delete-account`,
      headers: headers
    });
    
    console.log('Delete account response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Delete account error full details:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error message:', error.message);
    }
    
    throw error;
  }
};

// Reset password (forgot password)
const resetPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/reset-password`, { email });
    return response.data;
  } catch (error) {
    console.error('Reset password error:', error);
    // For demo/development purposes, simulate success when backend endpoint is not available
    if (error.response && error.response.status === 404) {
      console.log('Reset password endpoint not found. Simulating success for development.');
      // Return a simulated success response for testing/demo purposes
      return { 
        success: true, 
        msg: 'Password reset email would be sent in production. This is a simulated response.'
      };
    }
    // For any other error, throw it to be caught by the calling function
    throw error;
  }
};

// Update user (admin only)
const updateUser = async (userId, userData) => {
  setAuthHeader();
  const response = await axios.put(`${API_URL}/users/${userId}`, userData);
  return response.data;
};

// Update user status (admin only)
const updateUserStatus = async (userId, status) => {
  setAuthHeader();
  const response = await axios.put(`${API_URL}/users/${userId}/status`, { status });
  return response.data;
};

// Delete user (admin only)
const deleteUser = async (userId) => {
  setAuthHeader();
  const response = await axios.delete(`${API_URL}/users/${userId}`);
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  isLoggedIn,
  isAdmin,
  getToken,
  setAuthHeader,
  getAllUsers,
  createAdmin,
  updateProfile,
  changePassword,
  deleteAccount,
  resetPassword,
  updateUser,
  updateUserStatus,
  deleteUser
};

export default authService; 