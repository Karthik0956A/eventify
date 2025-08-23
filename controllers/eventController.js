const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const User = require('../models/User');
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
    // Only creator or admin can edit
    if (String(event.createdBy) !== req.session.user._id && req.session.user.role !== 'admin') {
      req.flash('error', 'Access denied.');
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
    // Only creator or admin can update
    if (String(event.createdBy) !== req.session.user._id && req.session.user.role !== 'admin') {
      req.flash('error', 'Access denied.');
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
    // Only creator or admin can delete
    if (String(event.createdBy) !== req.session.user._id && req.session.user.role !== 'admin') {
      req.flash('error', 'Access denied.');
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
      await RSVP.create({ 
        userId: req.session.user._id, 
        eventId: event._id, 
        paymentStatus: 'paid' 
      });
      
      // Decrement available seats
      event.remainingSeats -= 1;
      await event.save();
      
      req.flash('success', 'RSVP confirmed! You are registered for this free event.');
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
    const pendingEvents = await Event.find({ status: 'pending' }).populate('createdBy', 'name email');
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
    event.status = 'rejected';
    event.rejectionReason = rejectionReason || 'No reason provided';
    await event.save();
    req.flash('success', `Event "${event.title}" rejected.`);
    res.redirect('/events/admin/pending');
  } catch (err) {
    req.flash('error', 'Could not reject event.');
    res.redirect('/events/admin/pending');
  }
};

exports.approveAllEvents = async (req, res) => {
  try {
    const result = await Event.updateMany(
      { status: 'pending' },
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
