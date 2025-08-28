require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const expressLayouts = require('express-ejs-layouts');
const { GoogleGenerativeAI } =require("@google/generative-ai");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));

// EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// EJS Layouts
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
}));

// Flash messages
app.use(flash());

// Custom middleware for flash messages
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.user = req.session.user || null;
  next();
});

// Home route
const homeController = require('./controllers/homeController');
app.get('/', homeController.getHomePage);

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const extraRoutes = require('./routes/extraRoutes');
const qrRoutes = require('./routes/qrRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const supportRoutes = require('./routes/supportRoutes');
const { startReminders } = require('./jobs/reminderJob');
const airoute = require('./routes/airoutes');

// Socket.io chat logic
io.on('connection', (socket) => {
  socket.on('joinRoom', ({ eventId, user }) => {
    socket.join(eventId);
    socket.to(eventId).emit('chatMessage', { user: 'System', text: `${user.name} joined the chat.` });
  });
  socket.on('chatMessage', ({ eventId, user, text }) => {
    io.to(eventId).emit('chatMessage', { user: user.name, text });
  });
});

// Connect to MongoDB then start server
connectDB().then(() => {
  // Mount routes
  app.use('/auth', authRoutes);
  app.use('/events', eventRoutes);
  app.use('/payments', paymentRoutes);
  app.use('/dashboard', dashboardRoutes);
  app.use('/extra', extraRoutes);
  app.use('/qr', qrRoutes);
  app.use('/notifications', notificationRoutes);
  app.use('/support', supportRoutes);

  app.use('/ask-ai', airoute);

  // 404 handler
  app.use((req, res) => {
    res.status(404).render('404', { title: 'Not Found' });
  });

  startReminders();

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

module.exports = { app, server, io };
