const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { isAuthenticated } = require('../middleware/auth');

// Get user's notifications
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const notifications = await notificationController.getUserNotifications(req.session.user._id);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread count
router.get('/unread-count', isAuthenticated, async (req, res) => {
  try {
    const count = await notificationController.getUnreadCount(req.session.user._id);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Mark notification as read
router.put('/:id/read', isAuthenticated, async (req, res) => {
  try {
    const notification = await notificationController.markAsRead(req.params.id, req.session.user._id);
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', isAuthenticated, async (req, res) => {
  try {
    await notificationController.markAllAsRead(req.session.user._id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const notification = await notificationController.deleteNotification(req.params.id, req.session.user._id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

module.exports = router;
