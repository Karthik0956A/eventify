const nodemailer = require('nodemailer');

// Create transporter for Google SMTP
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send welcome email
exports.sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
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

// Send payment confirmation email
exports.sendPaymentConfirmationEmail = async (email, name, eventTitle, amount, eventDate) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: `Payment Confirmed - ${eventTitle} 🎫`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #2563eb 100%); color: white; padding: 2rem; text-align: center; border-radius: 10px;">
            <h1 style="margin: 0; font-size: 2rem;">Payment Confirmed!</h1>
            <p style="margin: 1rem 0 0 0; font-size: 1.1rem; opacity: 0.9;">Your event registration is complete</p>
          </div>
          
          <div style="padding: 2rem; background: #f8fafc;">
            <h2 style="color: #1e293b; margin-bottom: 1rem;">Hello ${name}! 🎉</h2>
            
            <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 1.5rem;">
              <h3 style="color: #10b981; margin: 0 0 1rem 0;">Event Registration Details:</h3>
              <p style="color: #475569; line-height: 1.6; margin: 0 0 0.5rem 0;"><strong>Event:</strong> ${eventTitle}</p>
              <p style="color: #475569; line-height: 1.6; margin: 0 0 0.5rem 0;"><strong>Date:</strong> ${eventDate}</p>
              <p style="color: #475569; line-height: 1.6; margin: 0 0 0.5rem 0;"><strong>Amount Paid:</strong> $${amount}</p>
              <p style="color: #475569; line-height: 1.6; margin: 0;"><strong>Status:</strong> <span style="color: #10b981; font-weight: 600;">Confirmed</span></p>
            </div>
            
            <p style="color: #475569; line-height: 1.6; margin-bottom: 1.5rem;">
              Your registration has been confirmed! You'll receive a reminder email the day before the event. 
              Don't forget to bring your QR code for check-in.
            </p>
            
            <div style="text-align: center;">
              <a href="${process.env.BASE_URL || 'http://localhost:3000'}/dashboard" 
                 style="background: #10b981; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
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
    console.log('Payment confirmation email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Payment confirmation email error:', error);
    throw error;
  }
};

// Send QR code email after registration
exports.sendQRCodeEmail = async (email, name, eventTitle, eventDate, eventLocation, qrCodeDataUrl) => {
  try {
    // First try with attachment method
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: `Your QR Code - ${eventTitle} 📱`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #2563eb 100%); color: white; padding: 2rem; text-align: center; border-radius: 10px;">
            <h1 style="margin: 0; font-size: 2rem;">Your Event QR Code</h1>
            <p style="margin: 1rem 0 0 0; font-size: 1.1rem; opacity: 0.9;">Keep this safe for event check-in</p>
          </div>
          
          <div style="padding: 2rem; background: #f8fafc;">
            <h2 style="color: #1e293b; margin-bottom: 1rem;">Hello ${name}! 🎫</h2>
            
            <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 1.5rem;">
              <h3 style="color: #8b5cf6; margin: 0 0 1rem 0;">Event Details:</h3>
              <p style="color: #475569; line-height: 1.6; margin: 0 0 0.5rem 0;"><strong>Event:</strong> ${eventTitle}</p>
              <p style="color: #475569; line-height: 1.6; margin: 0 0 0.5rem 0;"><strong>Date:</strong> ${eventDate}</p>
              <p style="color: #475569; line-height: 1.6; margin: 0;"><strong>Location:</strong> ${eventLocation}</p>
            </div>
            
            <div style="text-align: center; margin-bottom: 1.5rem;">
              <h3 style="color: #1e293b; margin-bottom: 1rem;">Your QR Code</h3>
              <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 2px dashed #8b5cf6; display: inline-block;">
                <img src="cid:qr-code" alt="Event QR Code" style="max-width: 200px; height: auto; display: block;">
              </div>
              <p style="color: #64748b; font-size: 0.875rem; margin-top: 1rem;">
                📱 Save this QR code to your phone or print it for easy check-in
              </p>
            </div>
            
            <div style="background: #fef3c7; padding: 1rem; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 1.5rem;">
              <h4 style="color: #92400e; margin: 0 0 0.5rem 0;">⚠️ Important Reminders:</h4>
              <ul style="color: #92400e; margin: 0; padding-left: 1.5rem;">
                <li>Bring this QR code to the event for check-in</li>
                <li>You can also show the QR code from your phone</li>
                <li>Keep this email safe until the event</li>
                <li>You'll receive a reminder email the day before the event</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.BASE_URL || 'http://localhost:3000'}/dashboard" 
                 style="background: #8b5cf6; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                View My Events
              </a>
            </div>
          </div>
          
          <div style="background: #1e293b; color: white; padding: 1.5rem; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="margin: 0; font-size: 0.875rem;">© ${new Date().getFullYear()} Eventify. All rights reserved.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'event-qr-code.png',
          content: qrCodeDataUrl.split(',')[1],
          encoding: 'base64',
          cid: 'qr-code'
        }
      ]
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('QR code email sent with attachment:', info.messageId);
      return info;
    } catch (attachmentError) {
      console.log('Attachment method failed, trying fallback method:', attachmentError.message);
      
      // Fallback: embed QR code directly as base64
      const fallbackMailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: `Your QR Code - ${eventTitle} 📱`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #2563eb 100%); color: white; padding: 2rem; text-align: center; border-radius: 10px;">
              <h1 style="margin: 0; font-size: 2rem;">Your Event QR Code</h1>
              <p style="margin: 1rem 0 0 0; font-size: 1.1rem; opacity: 0.9;">Keep this safe for event check-in</p>
            </div>
            
            <div style="padding: 2rem; background: #f8fafc;">
              <h2 style="color: #1e293b; margin-bottom: 1rem;">Hello ${name}! 🎫</h2>
              
              <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 1.5rem;">
                <h3 style="color: #8b5cf6; margin: 0 0 1rem 0;">Event Details:</h3>
                <p style="color: #475569; line-height: 1.6; margin: 0 0 0.5rem 0;"><strong>Event:</strong> ${eventTitle}</p>
                <p style="color: #475569; line-height: 1.6; margin: 0 0 0.5rem 0;"><strong>Date:</strong> ${eventDate}</p>
                <p style="color: #475569; line-height: 1.6; margin: 0;"><strong>Location:</strong> ${eventLocation}</p>
              </div>
              
              <div style="text-align: center; margin-bottom: 1.5rem;">
                <h3 style="color: #1e293b; margin-bottom: 1rem;">Your QR Code</h3>
                <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 2px dashed #8b5cf6; display: inline-block;">
                  <img src="${qrCodeDataUrl}" alt="Event QR Code" style="max-width: 200px; height: auto; display: block;">
                </div>
                <p style="color: #64748b; font-size: 0.875rem; margin-top: 1rem;">
                  📱 Save this QR code to your phone or print it for easy check-in
                </p>
              </div>
              
              <div style="background: #fef3c7; padding: 1rem; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 1.5rem;">
                <h4 style="color: #92400e; margin: 0 0 0.5rem 0;">⚠️ Important Reminders:</h4>
                <ul style="color: #92400e; margin: 0; padding-left: 1.5rem;">
                  <li>Bring this QR code to the event for check-in</li>
                  <li>You can also show the QR code from your phone</li>
                  <li>Keep this email safe until the event</li>
                  <li>You'll receive a reminder email the day before the event</li>
                </ul>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.BASE_URL || 'http://localhost:3000'}/dashboard" 
                   style="background: #8b5cf6; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
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

      const fallbackInfo = await transporter.sendMail(fallbackMailOptions);
      console.log('QR code email sent with fallback method:', fallbackInfo.messageId);
      return fallbackInfo;
    }
  } catch (error) {
    console.error('QR code email error:', error);
    throw error;
  }
};

// Send OTP email for password reset
exports.sendOTPEmail = async (email, name, otp) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Password Reset OTP - Eventify 🔐',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e42 0%, #2563eb 100%); color: white; padding: 2rem; text-align: center; border-radius: 10px;">
            <h1 style="margin: 0; font-size: 2rem;">Password Reset</h1>
            <p style="margin: 1rem 0 0 0; font-size: 1.1rem; opacity: 0.9;">Use the OTP below to reset your password</p>
          </div>
          
          <div style="padding: 2rem; background: #f8fafc;">
            <h2 style="color: #1e293b; margin-bottom: 1rem;">Hello ${name}! 🔐</h2>
            
            <p style="color: #475569; line-height: 1.6; margin-bottom: 1.5rem;">
              You requested a password reset for your Eventify account. Use the OTP below to complete the process.
            </p>
            
            <div style="background: white; padding: 2rem; border-radius: 8px; border: 2px solid #f59e42; margin-bottom: 1.5rem; text-align: center;">
              <h3 style="color: #f59e42; margin: 0 0 1rem 0; font-size: 1.5rem;">Your OTP Code</h3>
              <div style="background: #fef3c7; padding: 1rem; border-radius: 6px; display: inline-block;">
                <span style="font-size: 2rem; font-weight: bold; color: #f59e42; letter-spacing: 0.5rem;">${otp}</span>
              </div>
            </div>
            
            <p style="color: #dc2626; font-size: 0.875rem; margin-bottom: 1.5rem;">
              ⚠️ This OTP will expire in 10 minutes. If you didn't request this reset, please ignore this email.
            </p>
            
            <p style="color: #64748b; font-size: 0.875rem; text-align: center;">
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
    console.log('OTP email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('OTP email error:', error);
    throw error;
  }
};

// Send event reminder email
exports.sendEventReminder = async (email, name, eventTitle, eventDate, eventLocation) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
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

// Generic email sending function
exports.sendEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: to,
      subject: subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};
