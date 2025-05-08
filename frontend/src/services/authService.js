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
  
  // Try different token locations based on API response structure
  let token = null;
  
  if (user.token) {
    token = user.token;
  } else if (user.user && user.user.token) {
    token = user.user.token;
  }
  
  console.log("Retrieved token:", token);
  return token;
};

// Add token to requests
const setAuthHeader = () => {
  const token = getToken();
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
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
  createAdmin
};

export default authService; 