const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { 
  getUserNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} = require('../controllers/notificationController');

// Get user's notifications
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const notifications = await getUserNotifications(req.session.user._id);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread count
router.get('/unread-count', isAuthenticated, async (req, res) => {
  try {
    const count = await getUnreadCount(req.session.user._id);
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Mark notification as read
router.put('/:id/read', isAuthenticated, async (req, res) => {
  try {
    const notification = await markAsRead(req.params.id, req.session.user._id);
    if (notification) {
      res.json({ success: true, notification });
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', isAuthenticated, async (req, res) => {
  try {
    const result = await markAllAsRead(req.session.user._id);
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete single notification
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const notification = await deleteNotification(req.params.id, req.session.user._id);
    if (notification) {
      res.json({ success: true, message: 'Notification deleted successfully' });
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Delete all notifications
router.delete('/', isAuthenticated, async (req, res) => {
  try {
    const result = await deleteAllNotifications(req.session.user._id);
    res.json({ success: true, deletedCount: result.deletedCount, message: 'All notifications cleared' });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({ error: 'Failed to delete all notifications' });
  }
});

module.exports = router;
