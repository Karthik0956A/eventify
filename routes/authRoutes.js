const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);
router.get('/logout', authController.logout);

// Admin promotion routes
router.get('/promote/:userId', isAuthenticated, hasRole('admin'), authController.getPromoteUser);
router.post('/promote/:userId', isAuthenticated, hasRole('admin'), authController.promoteUser);

module.exports = router;
