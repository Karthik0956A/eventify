const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RSVP', rsvpSchema);
