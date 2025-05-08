const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
exports.protect = async (req, res, next) => {
  try {
    // Get token from header
    let token = req.header('x-auth-token');
    
    // Try alternative authorization header format
    const authHeader = req.header('Authorization');
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log('Using token from Authorization header');
    }
    
    console.log('Auth middleware called with:');
    console.log('- Method:', req.method);
    console.log('- Path:', req.path);
    console.log('- Headers:', Object.keys(req.headers).join(', '));
    console.log('- Token received:', token ? `${token.substring(0, 10)}...` : 'No token');
    console.log('- JWT Secret exists:', !!process.env.JWT_SECRET);
    console.log('- JWT Secret length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
    
    // Check if no token
    if (!token) {
      console.log('Auth failed: No token provided');
      return res.status(401).json({ 
        success: false, 
        message: 'No token, authorization denied' 
      });
    }
    
    try {
      // Verify token
      console.log('Verifying token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully. User ID:', decoded.id);
      
      // Add user from payload
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.log('Auth failed: User not found in database');
        return res.status(401).json({ 
          success: false, 
          message: 'User not found' 
        });
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
      console.log('Token verification error name:', verifyError.name);
      console.log('Token verification error stack:', verifyError.stack);
      
      if (verifyError.name === 'JsonWebTokenError') {
        // If the signature is invalid
        console.log('Invalid token signature. Check JWT_SECRET environment variable.');
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token signature', 
          error: verifyError.message 
        });
      } else if (verifyError.name === 'TokenExpiredError') {
        // If the token has expired
        console.log('Token has expired.');
        return res.status(401).json({ 
          success: false, 
          message: 'Token has expired', 
          error: verifyError.message 
        });
      }
      
      return res.status(401).json({ 
        success: false, 
        message: 'Token is not valid', 
        error: verifyError.message 
      });
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Server error in auth middleware', 
      error: err.message 
    });
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