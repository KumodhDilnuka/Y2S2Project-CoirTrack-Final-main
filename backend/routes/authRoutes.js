const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');
const fileUpload = require('express-fileupload');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/change-password', protect, authController.changePassword);
router.put('/profile', protect, authController.updateProfile);
router.delete('/delete-account', protect, authController.deleteAccount);

// Admin routes
router.post('/create-admin', protect, admin, authController.createAdmin);
router.get('/users', protect, admin, authController.getAllUsers);
router.put('/users/:id', protect, admin, authController.updateUser);
router.put('/users/:id/status', protect, admin, authController.updateUserStatus);
router.delete('/users/:id', protect, admin, authController.deleteUserById);
router.post('/send-email', protect, admin, fileUpload(), authController.sendEmail);

module.exports = router; 