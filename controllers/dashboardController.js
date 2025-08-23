const RSVP = require('../models/RSVP');
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { generateQR } = require('../utils/qr');

exports.index = async (req, res) => {
  try {
    const user = req.session.user;
    
    // Check if user is authenticated
    if (!user) {
      req.flash('error', 'Please login to access the dashboard.');
      return res.redirect('/auth/login');
    }
    
    let registeredEvents = [];
    let createdEvents = [];
    let allUsers = [];
    let allEvents = [];
    let pendingEvents = [];
    let analytics = { rsvps: 0, payments: 0, attendance: 0, pending: 0 };
    let qrCodes = {};
    
    if (user.role === 'user') {
      const rsvps = await RSVP.find({ userId: user._id, paymentStatus: 'paid' }).populate('eventId');
      registeredEvents = rsvps.map(r => r.eventId).filter(Boolean); // Filter out null events
      
      // Generate QR codes for valid RSVPs
      for (const rsvp of rsvps) {
        if (rsvp.eventId && rsvp.eventId._id) {
          try {
            qrCodes[rsvp.eventId._id] = await generateQR(rsvp._id.toString());
          } catch (qrError) {
            console.error('QR generation error for RSVP:', rsvp._id, qrError);
            qrCodes[rsvp.eventId._id] = null;
          }
        }
      }
      
      analytics.rsvps = rsvps.length;
      analytics.payments = await Payment.countDocuments({ userId: user._id, status: 'paid' });
      analytics.attendance = 0; // Placeholder
    } else if (user.role === 'organizer') {
      createdEvents = await Event.find({ createdBy: user._id });
      const eventIds = createdEvents.map(e => e._id);
      
      if (eventIds.length > 0) {
        analytics.rsvps = await RSVP.countDocuments({ eventId: { $in: eventIds } });
        analytics.payments = await Payment.countDocuments({ eventId: { $in: eventIds }, status: 'paid' });
      }
      
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
    
    // If there's a session error, redirect to login
    if (err.message && err.message.includes('Cannot read properties of null')) {
      req.flash('error', 'Session expired. Please login again.');
      return res.redirect('/auth/login');
    }
    
    // Otherwise, render dashboard with empty data
    res.render('dashboard/index', { 
      title: 'Dashboard', 
      user: req.session.user || null, 
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
