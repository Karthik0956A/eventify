const Notification = require('../models/Notification');

// Create a new notification
exports.createNotification = async (userId, title, message, type = 'system', relatedEventId = null, relatedUserId = null) => {
  try {
    const notification = new Notification({
      userId,
      title,
      message,
      type,
      relatedEventId,
      relatedUserId
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get user's notifications
exports.getUserNotifications = async (userId, limit = 10) => {
  try {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('relatedEventId', 'title')
      .populate('relatedUserId', 'name');
    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Get unread notification count
exports.getUnreadCount = async (userId) => {
  try {
    const count = await Notification.countDocuments({ userId, read: false });
    return count;
  } catch (error) {
    console.error('Error counting unread notifications:', error);
    throw error;
  }
};

// Mark notification as read
exports.markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true },
      { new: true }
    );
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (userId) => {
  try {
    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete notification
exports.deleteNotification = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: notificationId, userId });
    return notification;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};
