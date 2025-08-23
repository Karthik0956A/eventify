const cron = require('node-cron');
const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const User = require('../models/User');
const { sendEventReminder } = require('../utils/email');

// Send reminders for events happening tomorrow
const sendEventReminders = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Find events happening tomorrow
    const events = await Event.find({ 
      date: tomorrowStr, 
      status: 'approved' 
    });

    for (const event of events) {
      // Find all users registered for this event
      const rsvps = await RSVP.find({ 
        eventId: event._id, 
        paymentStatus: 'paid' 
      }).populate('userId');

      for (const rsvp of rsvps) {
        try {
          await sendEventReminder(
            rsvp.userId.email,
            rsvp.userId.name,
            event.title,
            event.date,
            event.location
          );
          console.log(`Reminder sent to ${rsvp.userId.email} for event: ${event.title}`);
        } catch (emailError) {
          console.error(`Failed to send reminder to ${rsvp.userId.email}:`, emailError);
        }
      }
    }

    console.log(`Event reminders processed for ${events.length} events on ${tomorrowStr}`);
  } catch (error) {
    console.error('Error sending event reminders:', error);
  }
};

// Send reminders for events happening in 1 hour
const sendHourlyReminders = async () => {
  try {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    
    // Find events happening in the next hour
    const events = await Event.find({ 
      status: 'approved' 
    });

    for (const event of events) {
      const eventDateTime = new Date(`${event.date}T${event.time}`);
      const timeDiff = eventDateTime.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      // If event is happening within the next hour
      if (hoursDiff >= 0 && hoursDiff <= 1) {
        const rsvps = await RSVP.find({ 
          eventId: event._id, 
          paymentStatus: 'paid' 
        }).populate('userId');

        for (const rsvp of rsvps) {
          try {
            await sendEventReminder(
              rsvp.userId.email,
              rsvp.userId.name,
              event.title,
              event.date,
              event.location
            );
            console.log(`Hourly reminder sent to ${rsvp.userId.email} for event: ${event.title}`);
          } catch (emailError) {
            console.error(`Failed to send hourly reminder to ${rsvp.userId.email}:`, emailError);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error sending hourly reminders:', error);
  }
};

// Start the reminder system
exports.startReminders = () => {
  console.log('Starting event reminder system...');

  // Send daily reminders at 9 AM
  cron.schedule('0 9 * * *', () => {
    console.log('Running daily event reminders...');
    sendEventReminders();
  });

  // Send hourly reminders every hour
  cron.schedule('0 * * * *', () => {
    console.log('Running hourly event reminders...');
    sendHourlyReminders();
  });

  console.log('Event reminder system started successfully!');
  console.log('- Daily reminders: 9:00 AM');
  console.log('- Hourly reminders: Every hour');
};
