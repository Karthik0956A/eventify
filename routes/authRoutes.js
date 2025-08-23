const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);
router.get('/logout', authController.logout);

// Forgot password routes
router.get('/forgot-password', authController.getForgotPassword);
router.post('/forgot-password', authController.postForgotPassword);
router.get('/reset-password', authController.getResetPassword);
router.post('/reset-password', authController.postResetPassword);

// Profile routes
router.get('/profile', isAuthenticated, authController.getProfile);
router.post('/update-password', isAuthenticated, authController.updatePassword);

// Admin promotion routes
router.get('/promote/:userId', isAuthenticated, hasRole('admin'), authController.getPromoteUser);
router.post('/promote/:userId', isAuthenticated, hasRole('admin'), authController.promoteUser);

module.exports = router;
