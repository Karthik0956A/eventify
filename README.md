<a href="https://eventify-uazq.onrender.com">Deployed Link</a><br><br>
<b>Admin Credentials</b><br>
Email:admin@eventify.com<br>
Password:admin123<br>
# Eventify - Event Management Platform

A comprehensive event management platform built with Node.js, Express, MongoDB, and Socket.io. Features include user registration, event creation, payment processing, real-time chat, notifications, and wallet management.

## 🚀 Features

### User Management
- **Enhanced Signup Flow**: Phone number, age, gender collection
- **Profile Management**: View and update user information
- **Password Management**: Change password with current password verification
- **Forgot Password**: OTP-based password reset via email

### Event Management
- **Event Creation**: Create events with approval workflow
- **Event Discovery**: Browse events with dynamic search and filtering
- **Event Details**: View comprehensive event information with organizer contact
- **Real-time Chat**: Socket.io powered chat for event participants

### Payment & Wallet System
- **Stripe Integration**: Secure payment processing
- **Wallet Management**: Automatic wallet balance updates
- **Revenue Sharing**: 90% to organizer, 10% to admin
- **Payment Confirmation**: Email notifications for successful payments

### Notifications
- **Real-time Notifications**: Bell icon with unread count
- **Email Notifications**: Welcome, payment confirmation, and OTP emails
- **Event Notifications**: Registration confirmations and updates

### Email System
- **Google SMTP**: Configured with Gmail
- **Email Templates**: Beautiful HTML templates for all email types
- **Welcome Emails**: Sent on successful registration
- **Payment Confirmations**: Detailed payment receipts

## 🛠️ Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Gmail account with app password
- Stripe account

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eventify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Database
   MONGO_URI=mongodb://localhost:27017/eventify
   
   # Session
   SESSION_SECRET=your-session-secret-here
   
   # Email (Google SMTP)
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASS=your-gmail-app-password
   
   # Stripe
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   
   # App
   PORT=3000
   BASE_URL=http://localhost:3000
   ```

4. **Gmail Setup**
   - Enable 2-factor authentication on your Gmail account
   - Generate an app password:
     1. Go to Google Account settings
     2. Security → 2-Step Verification → App passwords
     3. Generate a new app password for "Mail"
     4. Use this password in `SMTP_PASS`

5. **Database Setup**
   ```bash
   npm run setup
   ```

6. **Test Email Configuration**
   ```bash
   npm run test-email
   ```

7. **Start the application**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## 📧 Email Configuration

The application uses Google SMTP for sending emails. You only need to configure:
- `SMTP_USER`: Your Gmail address
- `SMTP_PASS`: Your Gmail app password

### Email Types
- **Welcome Email**: Sent on user registration
- **Payment Confirmation**: Sent after successful event registration
- **OTP Email**: Sent for password reset
- **Event Reminders**: Sent before events

## 💳 Payment System

The platform uses Stripe for payment processing with automatic wallet management:

- **Event Registration**: Users pay for event registration
- **Revenue Split**: 90% goes to event organizer, 10% to admin
- **Wallet Balances**: Automatically updated in user profiles
- **Payment Confirmation**: Email receipts sent to users

## 🔔 Notifications

### Real-time Notifications
- Bell icon in navbar shows unread count
- Click to view notification dropdown
- Mark individual or all notifications as read
- Notifications for:
  - Event registrations
  - Payment confirmations
  - System updates

### Email Notifications
- Welcome emails on registration
- Payment confirmation emails
- OTP emails for password reset
- Event reminder emails

## 🎯 Usage

### For Users
1. **Register**: Create account with enhanced profile information
2. **Browse Events**: Use dynamic search and filters
3. **Register for Events**: Pay and get confirmation emails
4. **Chat**: Participate in event-specific chat rooms
5. **Manage Profile**: Update password and view wallet balance

### For Organizers
1. **Create Events**: Submit events for admin approval
2. **Manage Events**: Edit and update event details
3. **Receive Payments**: Automatic wallet balance updates
4. **Monitor Registrations**: Real-time notification of new registrations

### For Admins
1. **Approve Events**: Review and approve pending events
2. **Manage Users**: Promote users to organizer/admin roles
3. **Monitor Platform**: View all events and user activities
4. **Revenue Management**: Receive 10% of all event payments

## 🔧 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/logout` - User logout
- `GET /auth/forgot-password` - Forgot password page
- `POST /auth/forgot-password` - Send OTP
- `GET /auth/reset-password` - Reset password page
- `POST /auth/reset-password` - Reset password with OTP
- `GET /auth/profile` - User profile
- `POST /auth/update-password` - Update password

### Events
- `GET /events` - List all events
- `GET /events/:id` - Get event details
- `POST /events` - Create new event
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event

### Payments
- `POST /payments/create-checkout-session` - Create Stripe session
- `GET /payments/success` - Payment success callback
- `GET /payments/cancel` - Payment cancel callback

### Notifications
- `GET /notifications` - Get user notifications
- `GET /notifications/unread-count` - Get unread count
- `PUT /notifications/:id/read` - Mark as read
- `PUT /notifications/mark-all-read` - Mark all as read
- `DELETE /notifications/:id` - Delete notification

## 🎨 UI Features

### Responsive Design
- Mobile-friendly interface
- Clean, modern design
- Toast notifications
- Dynamic search and filtering

### Real-time Features
- Live chat using Socket.io
- Real-time notifications
- Dynamic event filtering

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set in production:
- Database connection string
- Email credentials
- Stripe keys
- Session secret
- Base URL

### Security Considerations
- Use HTTPS in production
- Secure session configuration
- Environment variable protection
- Input validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review environment configuration
- Test email setup with `npm run test-email`
- Ensure all dependencies are installed

---

**Eventify** - Making event management simple and engaging! 🎉





