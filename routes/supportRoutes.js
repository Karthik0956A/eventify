const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

// User routes
router.get('/', isAuthenticated, supportController.getUserTickets);
router.post('/', isAuthenticated, supportController.createTicket);

// Admin routes
router.get('/admin/queries', hasRole('admin'), supportController.getAllTickets);
router.get('/admin/queries/:ticketId', hasRole('admin'), supportController.getTicketDetails);
router.post('/admin/queries/:ticketId/reply', hasRole('admin'), supportController.replyToTicket);

module.exports = router;
