# Eventify - Community Event Management Platform

A full-featured, production-ready platform for managing, discovering, and registering for community events.

## ✨ Features

### 🔐 Authentication & Authorization
- User registration, login, logout with session management
- Role-based access control (User, Organizer, Admin)
- Password hashing with bcrypt
- Admin can promote users to different roles
- **NEW:** Welcome email sent automatically on registration

### 📅 Event Management
- Create, edit, delete events (All authenticated users)
- **NEW:** Admin approval system for events before they go live
- **NEW:** Bulk approve all pending events
- Event details: title, description, location, date, time, category, price, capacity
- Banner image upload with Multer
- Real-time seat availability tracking
- Event discovery with search and filtering
- **NEW:** Event status tracking (pending, approved, rejected)

### 🎫 RSVP & Payments
- RSVP for events (prevents double registration)
- **NEW:** Only approved events can be RSVP'd
- Stripe payment integration for paid events
- Payment status tracking
- QR code generation for each RSVP

### 💬 Community Features
- Real-time event chat using Socket.io
- **NEW:** Enhanced event reminders via email (daily + hourly)
- QR code validation for event check-in

### 📊 Dashboard & Analytics
- User dashboard: view registered events, QR codes
- Organizer dashboard: manage created events, see pending count
- **NEW:** Admin dashboard: manage all users/events, review pending events, bulk actions
- Chart.js integration for visual analytics
- **NEW:** Pending events overview and quick actions

### 🎨 Modern UI/UX
- Clean, responsive design with custom CSS
- SweetAlert2 for beautiful toast notifications
- Mobile-friendly responsive layout
- Professional color scheme and typography
- **NEW:** Event status indicators and admin controls

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Templating:** EJS
- **Styling:** Custom CSS (no frameworks)
- **Authentication:** Express-session, bcrypt
- **File Upload:** Multer
- **Payments:** Stripe API
- **Real-time:** Socket.io
- **Email:** Nodemailer
- **Scheduling:** node-cron
- **QR Codes:** qrcode
- **Charts:** Chart.js
- **Notifications:** SweetAlert2

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Stripe account (for payments)

### 2. Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd Event-Mangment

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 3. Environment Configuration
Edit `.env` file with your credentials:
```env
# MongoDB connection
MONGO_URI=mongodb://localhost:27017/event-mgmt

# Session secret (any random string)
SESSION_SECRET=your_super_secret_session_key_here

# Stripe API keys (test mode)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# SMTP for email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM=your_email@gmail.com
```

### 4. Database Setup
```bash
# Create initial admin user
npm run setup

# This creates:
# Email: admin@eventify.com
# Password: admin123
# Role: admin
```

### 5. Test Email Configuration
```bash
# Test if your email setup is working
npm run test-email

# This will verify your SMTP configuration and send a test email
```

### 6. Run the Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 6. Access the Application
- **URL:** http://localhost:3000
- **Admin Login:** admin@eventify.com / admin123

## 📁 Project Structure

```
Event-Mangment/
├── config/          # Database configuration
├── controllers/     # Route logic and business logic
├── middleware/      # Authentication and authorization
├── models/          # Mongoose data models
├── routes/          # Express route definitions
├── views/           # EJS templates
│   ├── auth/        # Login/register pages
│   ├── dashboard/   # User/organizer/admin dashboards
│   ├── events/      # Event management pages
│   ├── layouts/     # Main layout template
│   └── partials/    # Reusable components
├── public/          # Static assets
│   ├── css/         # Custom stylesheets
│   ├── js/          # Client-side JavaScript
│   └── images/      # Uploaded images
├── utils/           # Utility functions
├── jobs/            # Scheduled tasks (reminders)
├── scripts/         # Setup and utility scripts
└── server.js        # Main application file
```

## 🔧 Configuration

### MongoDB
- Local: `mongodb://localhost:27017/event-mgmt`
- Cloud: Use MongoDB Atlas connection string

### Stripe (Test Mode)
1. Create account at [stripe.com](https://stripe.com)
2. Get test API keys from dashboard
3. Use test card: 4242 4242 4242 4242

### Gmail SMTP
1. Enable 2-Step Verification
2. Generate App Password
3. Use App Password (not regular password)

## 🎯 User Roles & Workflow

### 👤 User
- Browse and search **approved** events only
- RSVP for **approved** events
- View registered events
- Access event chat
- Receive email reminders
- **NEW:** Create events (subject to admin approval)

### 🎪 Organizer
- All User permissions
- Create and manage events
- Upload event banners
- View event analytics
- **NEW:** See pending event count in dashboard
- **NEW:** Events require admin approval before going live

### 👑 Admin
- All Organizer permissions
- Manage all users
- Promote users to different roles
- Access system-wide analytics
- Manage all events
- **NEW:** Review and approve/reject pending events
- **NEW:** Bulk approve all pending events
- **NEW:** See event status and approval workflow

## 🚀 Deployment

### Heroku
```bash
# Add MongoDB addon
heroku addons:create mongolab

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=your_secret
heroku config:set STRIPE_SECRET_KEY=your_key

# Deploy
git push heroku main
```

### Vercel
- Connect GitHub repository
- Set environment variables
- Deploy automatically

## 🐛 Troubleshooting

### Styles Not Loading
- Check if `/css/style.css` exists in `public/` folder
- Verify static middleware is configured
- Check browser console for 404 errors

### Database Connection Issues
- Verify MongoDB is running
- Check connection string in `.env`
- Ensure network access (for cloud databases)

### Payment Issues
- Use Stripe test keys
- Check Stripe dashboard for errors
- Verify webhook endpoints

### Email Not Sending
- Check SMTP credentials
- Verify Gmail App Password
- Check firewall/network restrictions

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check troubleshooting section
2. Review error logs
3. Create GitHub issue with details

---

**Happy Event Managing! 🎉**
