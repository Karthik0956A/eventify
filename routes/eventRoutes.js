const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { isAuthenticated, hasRole } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'public/images/' });

// List events (only show approved events to public)
router.get('/', eventController.listEvents);
// New event form (allow all authenticated users)
router.get('/new', isAuthenticated, eventController.getNewEvent);
// Create event (allow all authenticated users)
router.post('/', isAuthenticated, upload.single('banner'), eventController.createEvent);
// Show event details
router.get('/:id', eventController.showEvent);
// Edit event form (only creator or admin)
router.get('/:id/edit', isAuthenticated, eventController.getEditEvent);
// Update event (only creator or admin)
router.post('/:id', isAuthenticated, upload.single('banner'), eventController.updateEvent);
// Delete event (only creator or admin)
router.post('/:id/delete', isAuthenticated, eventController.deleteEvent);
// RSVP (only for approved events)
router.post('/:id/rsvp', isAuthenticated, eventController.rsvpEvent);

// Admin approval routes
router.get('/admin/pending', isAuthenticated, hasRole('admin'), eventController.getPendingEvents);
router.post('/admin/approve/:id', isAuthenticated, hasRole('admin'), eventController.approveEvent);
router.post('/admin/reject/:id', isAuthenticated, hasRole('admin'), eventController.rejectEvent);
router.post('/admin/approve-all', isAuthenticated, hasRole('admin'), eventController.approveAllEvents);

module.exports = router;
