const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { isAuthenticated } = require('../middleware/auth');

router.post('/create-checkout-session', isAuthenticated, paymentController.createCheckoutSession);
router.get('/success', isAuthenticated, paymentController.paymentSuccess);
router.get('/cancel', isAuthenticated, paymentController.paymentCancel);

module.exports = router;
