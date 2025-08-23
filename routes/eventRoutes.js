const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { isAuthenticated, hasRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Public routes
router.get('/', eventController.listEvents);
router.get('/:id', eventController.showEvent);

// Protected routes
router.use(isAuthenticated);

// Event management
router.get('/new', eventController.getNewEvent);
router.post('/', upload.single('banner'), eventController.createEvent);
router.get('/:id/edit', eventController.getEditEvent);
router.put('/:id', upload.single('banner'), eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

// RSVP
router.post('/:id/rsvp', eventController.rsvpEvent);

// Event details with registrations (for event creators)
router.get('/:id/details', eventController.showEventDetails);

// Admin routes
router.get('/admin/pending', hasRole('admin'), eventController.getPendingEvents);
router.post('/admin/:id/approve', hasRole('admin'), eventController.approveEvent);
router.post('/admin/:id/reject', hasRole('admin'), eventController.rejectEvent);
router.post('/admin/approve-all', hasRole('admin'), eventController.approveAllEvents);

module.exports = router;
