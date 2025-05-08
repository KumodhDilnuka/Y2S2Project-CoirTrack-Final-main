const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', protect, authController.getMe);

// Admin routes
router.post('/create-admin', protect, admin, authController.createAdmin);
router.get('/users', protect, admin, authController.getAllUsers);

module.exports = router; 