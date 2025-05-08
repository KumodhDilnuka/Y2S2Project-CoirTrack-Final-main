const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      phone
    });

    // Save user to DB (password will be hashed by pre-save hook)
    await user.save();

    // Generate JWT token
    const payload = {
      id: user.id
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Create admin user
// @route   POST /api/auth/create-admin
// @access  Protected/Admin
exports.createAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new admin user
    user = new User({
      name,
      email,
      password,
      role: 'admin'
    });

    // Save user to DB
    await user.save();

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check if user is disabled
    if (user.status === 'disabled') {
      return res.status(401).json({ msg: 'Your account has been disabled. Please contact an administrator.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT token
    const payload = {
      id: user.id
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Protected
exports.getMe = async (req, res) => {
  try {
    // Get user data without password
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/auth/users
// @access  Protected/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Reset password (forgot password)
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }

    // In a production environment, you would:
    // 1. Generate a reset token
    // 2. Store it in the user document with an expiry time
    // 3. Send an email with a link containing the token
    
    // For demo purposes, we'll just return success
    console.log(`Password reset requested for email: ${email}`);
    
    // Simulate email sending delay
    setTimeout(() => {
      console.log(`Email would be sent to ${email} in production`);
    }, 1000);

    return res.status(200).json({ 
      success: true, 
      msg: 'If an account with that email exists, a password reset link has been sent.' 
    });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Protected
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  console.log('Password change request received');
  console.log('Current user ID from token:', req.user?.id || 'No user ID in request');
  console.log('Request body has currentPassword:', !!currentPassword);
  console.log('Request body has newPassword:', !!newPassword);

  // Validate inputs
  if (!currentPassword || !newPassword) {
    console.log('Missing required password fields');
    return res.status(400).json({ 
      success: false, 
      msg: 'Current password and new password are required' 
    });
  }

  try {
    // Get user from database
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found with ID:', req.user.id);
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    
    console.log('User found:', user.email);

    // Check if current password is correct
    console.log('Comparing passwords...');
    const isMatch = await user.comparePassword(currentPassword);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Current password is incorrect');
      return res.status(400).json({ success: false, msg: 'Current password is incorrect' });
    }

    // Update password
    console.log('Updating password...');
    user.password = newPassword;
    await user.save();
    console.log('Password updated successfully for user:', user.email);

    return res.status(200).json({ 
      success: true, 
      msg: 'Password updated successfully' 
    });
  } catch (err) {
    console.error('Change password error:', err.message);
    console.error('Error stack:', err.stack);
    
    // Check for specific error types
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        msg: 'Invalid user ID format',
        error: err.message
      });
    } else if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        msg: 'Invalid data provided',
        error: err.message
      });
    }
    
    res.status(500).json({ 
      success: false, 
      msg: 'Server error while changing password',
      error: err.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Protected
exports.updateProfile = async (req, res) => {
  const { name, email, phone } = req.body;

  try {
    // Get user from database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, msg: 'Email is already in use' });
      }
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    
    await user.save();

    return res.status(200).json({ 
      success: true, 
      msg: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/delete-account
// @access  Protected
exports.deleteAccount = async (req, res) => {
  console.log('Delete account request received');
  console.log('Current user ID from token:', req.user?.id || 'No user ID in request');

  // Validate user ID
  if (!req.user?.id) {
    console.log('Missing user ID in request');
    return res.status(400).json({ 
      success: false, 
      msg: 'User ID is required' 
    });
  }

  try {
    // Verify user exists first
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found with ID:', req.user.id);
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    
    console.log('User found for deletion:', user.email);

    // Delete user account
    const result = await User.findByIdAndDelete(req.user.id);
    
    if (!result) {
      console.log('User not found for deletion');
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    
    console.log('Account deleted successfully for user:', user.email);
    
    return res.status(200).json({ 
      success: true, 
      msg: 'Account deleted successfully' 
    });
  } catch (err) {
    console.error('Delete account error:', err.message);
    console.error('Error stack:', err.stack);
    
    // Check for specific error types
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        msg: 'Invalid user ID format',
        error: err.message
      });
    }
    
    res.status(500).json({ 
      success: false, 
      msg: 'Server error while deleting account',
      error: err.message
    });
  }
};

// @desc    Update user status (admin only)
// @route   PUT /api/auth/users/:id/status
// @access  Protected/Admin
exports.updateUserStatus = async (req, res) => {
  const { status } = req.body;
  
  // Validate status
  if (!status || !['active', 'disabled'].includes(status)) {
    return res.status(400).json({ 
      success: false, 
      msg: 'Invalid status. Status must be either "active" or "disabled".'
    });
  }

  try {
    // Find user by ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        msg: 'User not found' 
      });
    }

    // Update user status
    user.status = status;
    await user.save();

    return res.status(200).json({ 
      success: true, 
      msg: `User status updated to ${status}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    console.error('Update user status error:', err.message);
    
    // Check for specific error types
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        msg: 'Invalid user ID format',
        error: err.message
      });
    } else if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        msg: 'Invalid data provided',
        error: err.message
      });
    }
    
    res.status(500).json({ 
      success: false, 
      msg: 'Server error while updating user status',
      error: err.message
    });
  }
};

// @desc    Update user (admin only)
// @route   PUT /api/auth/users/:id
// @access  Protected/Admin
exports.updateUser = async (req, res) => {
  const { name, email, role, status } = req.body;

  try {
    // Find user by ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        msg: 'User not found' 
      });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          msg: 'Email is already in use' 
        });
      }
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role && ['user', 'admin'].includes(role)) user.role = role;
    if (status && ['active', 'disabled'].includes(status)) user.status = status;
    
    await user.save();

    return res.status(200).json({ 
      success: true, 
      msg: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    console.error('Update user error:', err.message);
    
    // Check for specific error types
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        msg: 'Invalid user ID format',
        error: err.message
      });
    } else if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        msg: 'Invalid data provided',
        error: err.message
      });
    }
    
    res.status(500).json({ 
      success: false, 
      msg: 'Server error while updating user',
      error: err.message
    });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/auth/users/:id
// @access  Protected/Admin
exports.deleteUserById = async (req, res) => {
  try {
    const result = await User.findByIdAndDelete(req.params.id);
    
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        msg: 'User not found' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      msg: 'User deleted successfully' 
    });
  } catch (err) {
    console.error('Delete user error:', err.message);
    
    // Check for specific error types
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        msg: 'Invalid user ID format',
        error: err.message
      });
    }
    
    res.status(500).json({ 
      success: false, 
      msg: 'Server error while deleting user',
      error: err.message
    });
  }
};

// @desc    Send email to users
// @route   POST /api/auth/send-email
// @access  Protected/Admin
exports.sendEmail = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const recipients = JSON.parse(req.body.recipients || '[]');
    const manualRecipients = JSON.parse(req.body.manualRecipients || '[]');
    
    // Validation
    if (!subject || !message) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Subject and message are required' 
      });
    }
    
    if (recipients.length === 0 && manualRecipients.length === 0) {
      return res.status(400).json({ 
        success: false, 
        msg: 'At least one recipient is required' 
      });
    }
    
    // Get user emails from IDs
    let userEmails = [];
    if (recipients.length > 0) {
      const users = await User.find({ _id: { $in: recipients } });
      userEmails = users.map(user => user.email);
    }
    
    // Combine with manual recipients
    const allRecipients = [...userEmails, ...manualRecipients];
    
    // Handle file attachments
    let attachments = [];
    if (req.files && req.files.attachments) {
      // If single file, convert to array
      const files = Array.isArray(req.files.attachments) 
        ? req.files.attachments 
        : [req.files.attachments];
      
      attachments = files.map(file => ({
        filename: file.name,
        content: file.data
      }));
    }
    
    // Setup email transport
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      },
      secure: true
    });
    
    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      bcc: allRecipients.join(','), // Use BCC for privacy
      subject: subject,
      html: message,
      attachments: attachments
    };
    
    await transporter.sendMail(mailOptions);
    
    return res.status(200).json({ 
      success: true, 
      msg: 'Email sent successfully',
      sentCount: allRecipients.length
    });
  } catch (err) {
    console.error('Send email error:', err.message);
    res.status(500).json({ 
      success: false, 
      msg: 'Error sending email',
      error: err.message
    });
  }
}; 