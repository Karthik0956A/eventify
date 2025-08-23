const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send welcome email
exports.sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Welcome to Eventify! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #f59e42 100%); color: white; padding: 2rem; text-align: center; border-radius: 10px;">
            <h1 style="margin: 0; font-size: 2rem;">Welcome to Eventify!</h1>
            <p style="margin: 1rem 0 0 0; font-size: 1.1rem; opacity: 0.9;">Your community event management platform</p>
          </div>
          
          <div style="padding: 2rem; background: #f8fafc;">
            <h2 style="color: #1e293b; margin-bottom: 1rem;">Hello ${name}! 👋</h2>
            
            <p style="color: #475569; line-height: 1.6; margin-bottom: 1.5rem;">
              Thank you for joining Eventify! We're excited to have you as part of our community.
            </p>
            
            <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 1.5rem;">
              <h3 style="color: #2563eb; margin: 0 0 1rem 0;">What you can do now:</h3>
              <ul style="color: #475569; line-height: 1.6; margin: 0; padding-left: 1.5rem;">
                <li>Browse and discover amazing events</li>
                <li>Create your own events (subject to admin approval)</li>
                <li>RSVP for events you're interested in</li>
                <li>Connect with other event organizers</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.BASE_URL || 'http://localhost:3000'}/events" 
                 style="background: #2563eb; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Start Exploring Events
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 0.875rem; margin-top: 2rem; text-align: center;">
              If you have any questions, feel free to reach out to our support team.
            </p>
          </div>
          
          <div style="background: #1e293b; color: white; padding: 1.5rem; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="margin: 0; font-size: 0.875rem;">© ${new Date().getFullYear()} Eventify. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Welcome email error:', error);
    throw error;
  }
};

// Send event reminder email
exports.sendEventReminder = async (email, name, eventTitle, eventDate, eventLocation) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: `Reminder: ${eventTitle} is tomorrow! 📅`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e42 0%, #2563eb 100%); color: white; padding: 2rem; text-align: center; border-radius: 10px;">
            <h1 style="margin: 0; font-size: 2rem;">Event Reminder</h1>
            <p style="margin: 1rem 0 0 0; font-size: 1.1rem; opacity: 0.9;">Don't forget your upcoming event!</p>
          </div>
          
          <div style="padding: 2rem; background: #f8fafc;">
            <h2 style="color: #1e293b; margin-bottom: 1rem;">Hello ${name}! 👋</h2>
            
            <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 1.5rem;">
              <h3 style="color: #2563eb; margin: 0 0 1rem 0;">Event Details:</h3>
              <p style="color: #475569; line-height: 1.6; margin: 0 0 0.5rem 0;"><strong>Event:</strong> ${eventTitle}</p>
              <p style="color: #475569; line-height: 1.6; margin: 0 0 0.5rem 0;"><strong>Date:</strong> ${eventDate}</p>
              <p style="color: #475569; line-height: 1.6; margin: 0;"><strong>Location:</strong> ${eventLocation}</p>
            </div>
            
            <p style="color: #475569; line-height: 1.6; margin-bottom: 1.5rem;">
              We're looking forward to seeing you at the event! Make sure to bring your QR code for check-in.
            </p>
            
            <div style="text-align: center;">
              <a href="${process.env.BASE_URL || 'http://localhost:3000'}/dashboard" 
                 style="background: #f59e42; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                View My Events
              </a>
            </div>
          </div>
          
          <div style="background: #1e293b; color: white; padding: 1.5rem; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="margin: 0; font-size: 0.875rem;">© ${new Date().getFullYear()} Eventify. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Event reminder email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Event reminder email error:', error);
    throw error;
  }
};

// Test email configuration
exports.testEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};
