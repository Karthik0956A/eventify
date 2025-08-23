const RSVP = require('../models/RSVP');
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { generateQR } = require('../utils/qr');

exports.index = async (req, res) => {
  try {
    const user = req.session.user;
    let registeredEvents = [];
    let createdEvents = [];
    let allUsers = [];
    let allEvents = [];
    let pendingEvents = [];
    let analytics = { rsvps: 0, payments: 0, attendance: 0, pending: 0 };
    let qrCodes = {};
    
    if (user.role === 'user') {
      const rsvps = await RSVP.find({ userId: user._id, paymentStatus: 'paid' }).populate('eventId');
      registeredEvents = rsvps.map(r => r.eventId);
      for (const rsvp of rsvps) {
        qrCodes[rsvp.eventId._id] = await generateQR(rsvp._id.toString());
      }
      analytics.rsvps = rsvps.length;
      analytics.payments = await Payment.countDocuments({ userId: user._id, status: 'paid' });
      analytics.attendance = 0; // Placeholder
    } else if (user.role === 'organizer') {
      createdEvents = await Event.find({ createdBy: user._id });
      analytics.rsvps = await RSVP.countDocuments({ eventId: { $in: createdEvents.map(e => e._id) } });
      analytics.payments = await Payment.countDocuments({ eventId: { $in: createdEvents.map(e => e._id) }, status: 'paid' });
      analytics.attendance = 0; // Placeholder
      analytics.pending = await Event.countDocuments({ createdBy: user._id, status: 'pending' });
    } else if (user.role === 'admin') {
      allUsers = await User.find();
      allEvents = await Event.find();
      pendingEvents = await Event.find({ status: 'pending' }).populate('createdBy', 'name email');
      analytics.rsvps = await RSVP.countDocuments();
      analytics.payments = await Payment.countDocuments({ status: 'paid' });
      analytics.attendance = 0; // Placeholder
      analytics.pending = pendingEvents.length;
    }
    
    res.render('dashboard/index', {
      title: 'Dashboard',
      user,
      registeredEvents,
      createdEvents,
      allUsers,
      allEvents,
      pendingEvents,
      analytics,
      qrCodes
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.render('dashboard/index', { 
      title: 'Dashboard', 
      user: req.session.user, 
      registeredEvents: [], 
      createdEvents: [], 
      allUsers: [], 
      allEvents: [], 
      pendingEvents: [],
      analytics: { rsvps: 0, payments: 0, attendance: 0, pending: 0 }, 
      qrCodes: {} 
    });
  }
};
