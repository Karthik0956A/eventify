const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['registration', 'payment', 'event_update', 'system', 'support'], default: 'system' },
  read: { type: Boolean, default: false },
  relatedEventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  relatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
