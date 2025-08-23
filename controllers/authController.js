const User = require('../models/User');
const bcrypt = require('bcrypt');
const { sendWelcomeEmail } = require('../utils/email');

exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Login', user: req.session.user, layout: false });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/auth/login');
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/auth/login');
    }
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    req.flash('success', 'Login successful!');
    res.redirect('/');
  } catch (err) {
    req.flash('error', 'Something went wrong.');
    res.redirect('/auth/login');
  }
};

exports.getRegister = (req, res) => {
  res.render('auth/register', { title: 'Register', user: req.session.user, layout: false });
};

exports.postRegister = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      req.flash('error', 'Email already registered');
      return res.redirect('/auth/register');
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = new User({ name, email, passwordHash });
    await user.save();
    
    // Send welcome email
    try {
      await sendWelcomeEmail(email, name);
    } catch (emailErr) {
      console.error('Welcome email failed:', emailErr);
      // Don't fail registration if email fails
    }
    
    req.flash('success', 'Registration successful! Please login.');
    res.redirect('/auth/login');
  } catch (err) {
    req.flash('error', 'Something went wrong.');
    res.redirect('/auth/register');
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

// Admin promotion methods
exports.getPromoteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/dashboard');
    }
    res.render('auth/promote', { title: 'Promote User', targetUser: user, user: req.session.user });
  } catch (err) {
    req.flash('error', 'Could not load user.');
    res.redirect('/dashboard');
  }
};

exports.promoteUser = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/dashboard');
    }
    if (!['user', 'organizer', 'admin'].includes(role)) {
      req.flash('error', 'Invalid role.');
      return res.redirect('/auth/promote/' + user._id);
    }
    user.role = role;
    await user.save();
    req.flash('success', `User ${user.name} promoted to ${role}!`);
    res.redirect('/dashboard');
  } catch (err) {
    req.flash('error', 'Could not promote user.');
    res.redirect('/dashboard');
  }
};
