const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
exports.protect = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');
    console.log('Received token:', token ? 'Token exists' : 'No token');
    
    // Check if no token
    if (!token) {
      console.log('Auth failed: No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully. User ID:', decoded.id);
      
      // Add user from payload
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.log('Auth failed: User not found in database');
        return res.status(401).json({ message: 'User not found' });
      }
      
      console.log('User authenticated:', {
        id: user.id,
        role: user.role,
        name: user.name
      });
      
      req.user = user;
      next();
    } catch (verifyError) {
      console.log('Token verification failed:', verifyError.message);
      return res.status(401).json({ message: 'Token is not valid', error: verifyError.message });
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ message: 'Server error in auth middleware', error: err.message });
  }
};

// Middleware to check if user is admin
exports.admin = (req, res, next) => {
  if (!req.user) {
    console.log('Admin check failed: No user in request');
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  console.log('Admin check for user:', {
    id: req.user.id,
    role: req.user.role,
    name: req.user.name
  });
  
  if (req.user.role === 'admin') {
    console.log('Admin access granted');
    next();
  } else {
    console.log('Admin access denied. User role:', req.user.role);
    res.status(403).json({ message: 'Admin access required' });
  }
}; 