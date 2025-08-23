const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { sendPaymentConfirmationEmail, sendQRCodeEmail } = require('../utils/email');
const { createNotification } = require('../controllers/notificationController');
const QRCode = require('qrcode');

exports.createCheckoutSession = async (req, res) => {
  try {
    const { eventId } = req.body;
    const event = await Event.findById(eventId);
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }

    // Check if event is approved
    if (event.status !== 'approved') {
      req.flash('error', 'This event is not yet approved');
      return res.redirect('/events/' + eventId);
    }

    // Check if event has available seats
    if (event.remainingSeats <= 0) {
      req.flash('error', 'Event is full');
      return res.redirect('/events/' + eventId);
    }

    // Find or create RSVP
    let rsvp = await RSVP.findOne({ userId: req.session.user._id, eventId: event._id });
    
    if (!rsvp) {
      // Create new RSVP
      rsvp = await RSVP.create({ 
        userId: req.session.user._id, 
        eventId: event._id, 
        paymentStatus: 'pending' 
      });
      
      // Decrement available seats
      event.remainingSeats -= 1;
      await event.save();
      
      console.log(`RSVP created for user ${req.session.user._id} on event ${event._id}`);
    } else if (rsvp.paymentStatus === 'paid') {
      req.flash('error', 'You have already registered for this event');
      return res.redirect('/events/' + eventId);
    }

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: event.title },
          unit_amount: Math.round(event.price * 100),
        },
        quantity: 1,
      }],
      customer_email: req.session.user.email,
      success_url: `${req.protocol}://${req.get('host')}/payments/success?session_id={CHECKOUT_SESSION_ID}&eventId=${event._id}`,
      cancel_url: `${req.protocol}://${req.get('host')}/payments/cancel?eventId=${event._id}`,
      metadata: {
        eventId: event._id.toString(),
        userId: req.session.user._id.toString(),
        rsvpId: rsvp._id.toString()
      }
    });

    // Store payment
    await Payment.create({
      userId: req.session.user._id,
      eventId: event._id,
      rsvpId: rsvp._id,
      amount: event.price,
      stripeSessionId: session.id,
      status: 'pending',
    });

    console.log(`Payment session created: ${session.id} for event ${event._id}`);
    res.redirect(303, session.url);
  } catch (err) {
    console.error('Payment session creation error:', err);
    req.flash('error', 'Could not start payment. Please try again.');
    res.redirect('/events');
  }
};

exports.paymentSuccess = async (req, res) => {
  try {
    const { session_id, eventId } = req.query;
    
    // Verify the session with Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') {
      req.flash('error', 'Payment not completed');
      return res.redirect('/events/' + eventId);
    }

    // Find and update payment
    const payment = await Payment.findOne({ stripeSessionId: session_id });
    if (!payment) {
      req.flash('error', 'Payment record not found');
      return res.redirect('/events/' + eventId);
    }

    payment.status = 'paid';
    await payment.save();

    // Update RSVP payment status
    const rsvp = await RSVP.findById(payment.rsvpId);
    if (rsvp) {
      rsvp.paymentStatus = 'paid';
      await rsvp.save();
      console.log(`RSVP ${rsvp._id} marked as paid`);
    }

    // Get event and user details
    const event = await Event.findById(eventId);
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }
    
    const user = await User.findById(req.session.user._id);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/events');
    }
    
    const organizer = await User.findById(event.createdBy);
    if (!organizer) {
      req.flash('error', 'Event organizer not found');
      return res.redirect('/events');
    }

    // Update wallet balances
    const organizerAmount = event.price * 0.9; // 90% to organizer
    const adminAmount = event.price * 0.1; // 10% to admin

    // Update organizer's wallet
    organizer.walletBalance += organizerAmount;
    await organizer.save();

    // Find admin user and update their wallet
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      adminUser.walletBalance += adminAmount;
      await adminUser.save();
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

    // Send payment confirmation email
    try {
      await sendPaymentConfirmationEmail(
        user.email, 
        user.name, 
        event.title, 
        event.price, 
        event.date
      );
    } catch (emailErr) {
      console.error('Payment confirmation email failed:', emailErr);
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

    req.flash('success', 'Payment successful! You are registered for the event. Check your email for the QR code.');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Payment success error:', err);
    req.flash('error', 'Payment could not be verified. Please contact support.');
    res.redirect('/events');
  }
};

exports.paymentCancel = async (req, res) => {
  try {
    const { eventId } = req.query;
    
    // Find the pending RSVP and remove it
    const rsvp = await RSVP.findOne({ 
      userId: req.session.user._id, 
      eventId: eventId, 
      paymentStatus: 'pending' 
    });
    
    if (rsvp) {
      // Remove the RSVP
      await RSVP.findByIdAndDelete(rsvp._id);
      
      // Increment available seats back
      const event = await Event.findById(eventId);
      if (event) {
        event.remainingSeats += 1;
        await event.save();
      }
      
      console.log(`RSVP cancelled and removed for event ${eventId}`);
    }

    req.flash('info', 'Payment cancelled. Your RSVP has been removed.');
    res.redirect('/events/' + eventId);
  } catch (err) {
    console.error('Payment cancel error:', err);
    req.flash('error', 'Could not process cancellation.');
    res.redirect('/events');
  }
};
