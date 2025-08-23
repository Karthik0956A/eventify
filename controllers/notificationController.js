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
exports.getUserNotifications = async (userId) => {
  try {
    return await Notification.find({ userId }).sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

// Get unread notification count
exports.getUnreadCount = async (userId) => {
  try {
    return await Notification.countDocuments({ userId, read: false });
  } catch (error) {
    console.error('Error getting unread count:', error);
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
    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );
    return result;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete notification
exports.deleteNotification = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId
    });
    return notification;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

exports.deleteAllNotifications = async (userId) => {
  try {
    const result = await Notification.deleteMany({ userId });
    return result;
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw error;
  }
};
