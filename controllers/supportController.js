const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');
const { createNotification } = require('./notificationController');

// Get all tickets for admin
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .populate('user', 'name email')
      .populate('adminRepliedBy', 'name')
      .sort({ createdAt: -1 })
      .lean(); // Convert to plain objects for better performance
    
    // Filter out tickets with invalid user references
    const validTickets = tickets.filter(ticket => ticket.user);
    
    console.log(`Found ${tickets.length} total tickets, ${validTickets.length} with valid users`);
    
    res.render('admin/queries', { 
      title: 'Support Queries', 
      tickets: validTickets,
      user: req.session.user 
    });
  } catch (err) {
    console.error('Error fetching tickets:', err);
    req.flash('error', 'Could not load support tickets.');
    res.redirect('/dashboard');
  }
};

// Get user's tickets
exports.getUserTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.session.user._id })
      .sort({ createdAt: -1 });
    
    res.render('support/index', { 
      title: 'Help & Support', 
      tickets,
      user: req.session.user 
    });
  } catch (err) {
    console.error('Error fetching user tickets:', err);
    req.flash('error', 'Could not load your tickets.');
    res.redirect('/dashboard');
  }
};

// Create new ticket
exports.createTicket = async (req, res) => {
  try {
    const { subject, description } = req.body;
    
    if (!subject || !description) {
      req.flash('error', 'Subject and description are required.');
      return res.redirect('/support');
    }
    
    const ticket = new SupportTicket({
      user: req.session.user._id,
      subject: subject.trim(),
      description: description.trim()
    });
    
    await ticket.save();
    req.flash('success', 'Support ticket created successfully! We will get back to you soon.');
    res.redirect('/support');
  } catch (err) {
    console.error('Error creating ticket:', err);
    req.flash('error', 'Could not create support ticket.');
    res.redirect('/support');
  }
};

// Admin reply to ticket
exports.replyToTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { reply } = req.body;
    
    if (!reply || reply.trim().length === 0) {
      req.flash('error', 'Reply message is required.');
      return res.redirect('/support/admin/queries');
    }
    
    const ticket = await SupportTicket.findById(ticketId).populate('user', 'name email');
    if (!ticket) {
      req.flash('error', 'Ticket not found.');
      return res.redirect('/support/admin/queries');
    }
    
    // Update ticket
    ticket.adminReply = reply.trim();
    ticket.adminRepliedAt = new Date();
    ticket.adminRepliedBy = req.session.user._id;
    ticket.status = 'resolved';
    await ticket.save();
    
    // Send email to user
    const emailContent = `
      <h2>Response to your support ticket</h2>
      <p><strong>Subject:</strong> ${ticket.subject}</p>
      <p><strong>Your message:</strong></p>
      <p>${ticket.description}</p>
      <hr>
      <p><strong>Admin Response:</strong></p>
      <p>${reply}</p>
      <p>Thank you for contacting us!</p>
    `;
    
    await sendEmail(
      ticket.user.email,
      `Response to your support ticket: ${ticket.subject}`,
      emailContent
    );
    
    // Create notification for user
    await createNotification(
      ticket.user._id,
      'Support Ticket Response',
      `You have a reply to your support ticket "${ticket.subject}". Please check your email for details.`,
      'support'
    );
    
    req.flash('success', 'Reply sent successfully and ticket marked as resolved.');
    res.redirect('/support/admin/queries');
  } catch (err) {
    console.error('Error replying to ticket:', err);
    req.flash('error', 'Could not send reply.');
    res.redirect('/support/admin/queries');
  }
};

// Get ticket details for admin
exports.getTicketDetails = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await SupportTicket.findById(ticketId)
      .populate('user', 'name email')
      .populate('adminRepliedBy', 'name')
      .lean(); // Convert to plain object
    
    if (!ticket) {
      req.flash('error', 'Ticket not found.');
      return res.redirect('/support/admin/queries');
    }
    
    // Check if user exists
    if (!ticket.user) {
      req.flash('error', 'Ticket has invalid user reference.');
      return res.redirect('/support/admin/queries');
    }
    
    res.render('admin/ticket-details', { 
      title: 'Ticket Details', 
      ticket,
      user: req.session.user 
    });
  } catch (err) {
    console.error('Error fetching ticket details:', err);
    req.flash('error', 'Could not load ticket details.');
    res.redirect('/support/admin/queries');
  }
};
