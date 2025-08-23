const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const User = require('../models/User');
const { sendQRCodeEmail } = require('../utils/email');
const { createNotification } = require('../controllers/notificationController');
const QRCode = require('qrcode');
const path = require('path');

exports.listEvents = async (req, res) => {
  try {
    const { q, category, date } = req.query;
    let filter = { status: 'approved' }; // Only show approved events
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    if (category) filter.category = category;
    if (date) filter.date = date;
    const events = await Event.find(filter).sort({ date: 1 });
    res.render('events/index', { title: 'Events', events: events || [], user: req.session.user });
  } catch (err) {
    req.flash('error', 'Could not load events.');
    res.render('events/index', { title: 'Events', events: [], user: req.session.user });
  }
};

exports.getNewEvent = (req, res) => {
  res.render('events/new', { title: 'Create Event', user: req.session.user });
};

exports.createEvent = async (req, res) => {
  try {
    const { title, description, location, date, time, category, price, capacity } = req.body;
    let bannerUrl = '';
    if (req.file) {
      bannerUrl = '/images/' + req.file.filename;
    }
    const event = new Event({
      title,
      description,
      location,
      date,
      time,
      category,
      price: price || 0,
      capacity,
      remainingSeats: capacity,
      createdBy: req.session.user._id,
      bannerUrl,
      status: 'pending' // Events start as pending
    });
    await event.save();
    req.flash('success', 'Event created successfully! It will be reviewed by an admin before going live.');
    res.redirect('/events');
  } catch (err) {
    console.error('Event creation error:', err);
    req.flash('error', 'Could not create event.');
    res.redirect('/events/new');
  }
};

exports.showEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      req.flash('error', 'Event not found.');
      return res.redirect('/events');
    }
    // Only show approved events to public
    if (event.status !== 'approved' && (!req.session.user || (String(event.createdBy) !== req.session.user._id && req.session.user.role !== 'admin'))) {
      req.flash('error', 'Event not found or not yet approved.');
      return res.redirect('/events');
    }
    
    // Get user's RSVPs for this event if logged in
    let userRSVPs = null;
    if (req.session.user) {
      userRSVPs = await RSVP.find({ 
        userId: req.session.user._id, 
        eventId: event._id 
      });
    }
    
    // Get organizer information
    const organizer = await User.findById(event.createdBy);
    
    res.render('events/show', { 
      title: event.title, 
      event, 
      user: req.session.user,
      userRSVPs: userRSVPs,
      organizer: organizer
    });
  } catch (err) {
    req.flash('error', 'Could not load event.');
    res.redirect('/events');
  }
};

exports.getEditEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      req.flash('error', 'Event not found.');
      return res.redirect('/events');
    }
    // Only creator can edit (admin can only edit their own events)
    if (String(event.createdBy) !== req.session.user._id) {
      req.flash('error', 'Access denied. You can only edit events you created.');
      return res.redirect('/events');
    }
    res.render('events/edit', { title: 'Edit Event', event, user: req.session.user });
  } catch (err) {
    req.flash('error', 'Could not load event.');
    res.redirect('/events');
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      req.flash('error', 'Event not found.');
      return res.redirect('/events');
    }
    // Only creator can update (admin can only update their own events)
    if (String(event.createdBy) !== req.session.user._id) {
      req.flash('error', 'Access denied. You can only update events you created.');
      return res.redirect('/events');
    }
    const { title, description, location, date, time, category, price, capacity } = req.body;
    event.title = title;
    event.description = description;
    event.location = location;
    event.date = date;
    event.time = time;
    event.category = category;
    event.price = price || 0;
    // If capacity changes, update remainingSeats accordingly
    if (capacity && capacity != event.capacity) {
      const diff = capacity - event.capacity;
      event.capacity = capacity;
      event.remainingSeats += diff;
      if (event.remainingSeats < 0) event.remainingSeats = 0;
    }
    if (req.file) {
      event.bannerUrl = '/images/' + req.file.filename;
    }
    // Reset approval status when event is modified
    if (event.status === 'approved') {
      event.status = 'pending';
      event.approvedBy = undefined;
      event.approvedAt = undefined;
    }
    await event.save();
    req.flash('success', 'Event updated! It will be reviewed again by an admin.');
    res.redirect('/events/' + event._id);
  } catch (err) {
    req.flash('error', 'Could not update event.');
    res.redirect('/events');
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      req.flash('error', 'Event not found.');
      return res.redirect('/events');
    }
    // Only creator can delete (admin can only delete their own events)
    if (String(event.createdBy) !== req.session.user._id) {
      req.flash('error', 'Access denied. You can only delete events you created.');
      return res.redirect('/events');
    }
    await event.deleteOne();
    req.flash('success', 'Event deleted!');
    res.redirect('/events');
  } catch (err) {
    req.flash('error', 'Could not delete event.');
    res.redirect('/events');
  }
};

exports.rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      req.flash('error', 'Event not found.');
      return res.redirect('/events');
    }
    // Only allow RSVP for approved events
    if (event.status !== 'approved') {
      req.flash('error', 'This event is not yet approved.');
      return res.redirect('/events/' + event._id);
    }
    if (event.remainingSeats <= 0) {
      req.flash('error', 'Event is full.');
      return res.redirect('/events/' + event._id);
    }
    
    // For free events, create RSVP directly
    if (event.price === 0) {
      // Prevent double RSVP
      const existing = await RSVP.findOne({ userId: req.session.user._id, eventId: event._id });
      if (existing) {
        if (existing.paymentStatus === 'paid') {
          req.flash('error', 'You have already registered for this event.');
          return res.redirect('/events/' + event._id);
        } else if (existing.paymentStatus === 'pending') {
          req.flash('info', 'You have a pending registration.');
          return res.redirect('/events/' + event._id);
        }
      }
      
      // Create RSVP and mark as paid (since it's free)
      const rsvp = await RSVP.create({ 
        userId: req.session.user._id, 
        eventId: event._id, 
        paymentStatus: 'paid' 
      });
      
      // Decrement available seats
      event.remainingSeats -= 1;
      await event.save();
      
      // Get user details for email
      const user = await User.findById(req.session.user._id);
      if (!user) {
        req.flash('error', 'User not found');
        return res.redirect('/events/' + event._id);
      }
      
      const organizer = await User.findById(event.createdBy);
      if (!organizer) {
        req.flash('error', 'Event organizer not found');
        return res.redirect('/events/' + event._id);
      }
      
      // Generate QR code for the RSVP
      const qrCodeData = JSON.stringify({
        rsvpId: rsvp._id.toString(),
        userId: user._id.toString(),
        eventId: event._id.toString(),
        eventTitle: event.title
      });

      let qrCodeDataUrl;
      try {
        qrCodeDataUrl = await QRCode.toDataURL(qrCodeData);
      } catch (qrError) {
        console.error('QR code generation error:', qrError);
        qrCodeDataUrl = null;
      }

      // Send QR code email
      if (qrCodeDataUrl) {
        try {
          await sendQRCodeEmail(
            user.email,
            user.name,
            event.title,
            event.date,
            event.location,
            qrCodeDataUrl
          );
        } catch (qrEmailErr) {
          console.error('QR code email failed:', qrEmailErr);
        }
      }

      // Create notifications
      try {
        // Notification for user
        await createNotification(
          user._id,
          'Registration Successful',
          `Registration successful for ${event.title}`,
          'registration',
          event._id
        );

        // Notification for organizer
        await createNotification(
          organizer._id,
          'New Registration',
          `${user.name} registered for ${event.title}`,
          'registration',
          event._id,
          user._id
        );
      } catch (notificationErr) {
        console.error('Notification creation failed:', notificationErr);
      }
      
      req.flash('success', 'RSVP confirmed! You are registered for this free event. Check your email for the QR code.');
      res.redirect('/events/' + event._id);
    } else {
      // For paid events, redirect to payment
      const existing = await RSVP.findOne({ userId: req.session.user._id, eventId: event._id });
      if (existing) {
        if (existing.paymentStatus === 'paid') {
          req.flash('error', 'You have already registered for this event.');
          return res.redirect('/events/' + event._id);
        } else if (existing.paymentStatus === 'pending') {
          req.flash('info', 'You have a pending registration. Please complete your payment.');
          return res.redirect('/events/' + event._id);
        }
      }
      
      req.flash('info', 'Please proceed to payment to complete your registration.');
      res.redirect('/events/' + event._id);
    }
  } catch (err) {
    console.error('RSVP error:', err);
    req.flash('error', 'Could not process RSVP.');
    res.redirect('/events');
  }
};

// Admin approval methods
exports.getPendingEvents = async (req, res) => {
  try {
    // Only show pending events created by other users (not by the admin)
    const pendingEvents = await Event.find({ 
      status: 'pending',
      createdBy: { $ne: req.session.user._id } // Not created by current admin
    }).populate('createdBy', 'name email');
    res.render('events/pending', { title: 'Pending Events', events: pendingEvents, user: req.session.user });
  } catch (err) {
    req.flash('error', 'Could not load pending events.');
    res.redirect('/dashboard');
  }
};

exports.approveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      req.flash('error', 'Event not found.');
      return res.redirect('/events/admin/pending');
    }
    
    // Admin cannot approve their own events
    if (String(event.createdBy) === req.session.user._id) {
      req.flash('error', 'You cannot approve your own events.');
      return res.redirect('/events/admin/pending');
    }
    
    event.status = 'approved';
    event.approvedBy = req.session.user._id;
    event.approvedAt = new Date();
    await event.save();
    req.flash('success', `Event "${event.title}" approved successfully!`);
    res.redirect('/events/admin/pending');
  } catch (err) {
    req.flash('error', 'Could not approve event.');
    res.redirect('/events/admin/pending');
  }
};

exports.rejectEvent = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) {
      req.flash('error', 'Event not found.');
      return res.redirect('/events/admin/pending');
    }
    
    // Admin cannot reject their own events
    if (String(event.createdBy) === req.session.user._id) {
      req.flash('error', 'You cannot reject your own events.');
      return res.redirect('/events/admin/pending');
    }
    
    // Delete the event from database instead of marking as rejected
    await event.deleteOne();
    req.flash('success', `Event "${event.title}" has been rejected and removed.`);
    res.redirect('/events/admin/pending');
  } catch (err) {
    req.flash('error', 'Could not reject event.');
    res.redirect('/events/admin/pending');
  }
};

exports.approveAllEvents = async (req, res) => {
  try {
    // Only approve events created by other users
    const result = await Event.updateMany(
      { 
        status: 'pending',
        createdBy: { $ne: req.session.user._id } // Not created by current admin
      },
      { 
        status: 'approved', 
        approvedBy: req.session.user._id, 
        approvedAt: new Date() 
      }
    );
    req.flash('success', `${result.modifiedCount} events approved successfully!`);
    res.redirect('/events/admin/pending');
  } catch (err) {
    req.flash('error', 'Could not approve all events.');
    res.redirect('/events/admin/pending');
  }
};

// Show event details with registered users (for event creators)
exports.showEventDetails = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      req.flash('error', 'Event not found.');
      return res.redirect('/dashboard');
    }
    
    // Only event creator can view details
    if (String(event.createdBy) !== req.session.user._id) {
      req.flash('error', 'Access denied. You can only view details of events you created.');
      return res.redirect('/dashboard');
    }
    
    // Get all RSVPs for this event with user details
    const rsvps = await RSVP.find({ 
      eventId: event._id,
      paymentStatus: 'paid'
    }).populate('userId', 'name email phone age gender');
    
    // Get organizer information
    const organizer = await User.findById(event.createdBy);
    
    res.render('events/details', { 
      title: `Event Details - ${event.title}`, 
      event, 
      user: req.session.user,
      organizer: organizer,
      registrations: rsvps
    });
  } catch (err) {
    console.error('Event details error:', err);
    req.flash('error', 'Could not load event details.');
    res.redirect('/dashboard');
  }
};
