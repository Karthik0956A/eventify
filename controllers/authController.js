const User = require('../models/User');
const bcrypt = require('bcrypt');
const { sendWelcomeEmail, sendOTPEmail } = require('../utils/email');

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
    res.redirect('/events');
  } catch (err) {
    req.flash('error', 'Something went wrong.');
    res.redirect('/auth/login');
  }
};

exports.getRegister = (req, res) => {
  res.render('auth/register', { title: 'Register', user: req.session.user, layout: false });
};

exports.postRegister = async (req, res) => {
  const { name, email, password, phone, age, gender } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      req.flash('error', 'Email already registered');
      return res.redirect('/auth/register');
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = new User({ 
      name, 
      email, 
      passwordHash, 
      phone, 
      age: age ? parseInt(age) : undefined, 
      gender 
    });
    await user.save();
    
    // Send welcome email
    try {
      await sendWelcomeEmail(email, name);
    } catch (emailErr) {
      console.error('Welcome email failed:', emailErr);
      // Don't fail registration if email fails
    }
    
    // Set session and redirect to home page
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    req.flash('success', 'Registration successful! Welcome to Eventify!');
    res.redirect('/events');
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

// Forgot password functionality
exports.getForgotPassword = (req, res) => {
  res.render('auth/forgot-password', { title: 'Forgot Password', user: req.session.user, layout: false });
};

exports.postForgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'Email not found in our system.');
      return res.redirect('/auth/forgot-password');
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, user.name, otp);
      req.flash('success', 'OTP sent to your email. Please check your inbox.');
      res.redirect('/auth/reset-password');
    } catch (emailErr) {
      console.error('OTP email failed:', emailErr);
      req.flash('error', 'Failed to send OTP. Please try again.');
      res.redirect('/auth/forgot-password');
    }
  } catch (err) {
    req.flash('error', 'Something went wrong.');
    res.redirect('/auth/forgot-password');
  }
};

exports.getResetPassword = (req, res) => {
  res.render('auth/reset-password', { title: 'Reset Password', user: req.session.user, layout: false });
};

exports.postResetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'Email not found.');
      return res.redirect('/auth/reset-password');
    }

    if (!user.otp || user.otp !== otp) {
      req.flash('error', 'Invalid OTP.');
      return res.redirect('/auth/reset-password');
    }

    if (new Date() > user.otpExpires) {
      req.flash('error', 'OTP has expired. Please request a new one.');
      return res.redirect('/auth/forgot-password');
    }

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordHash = passwordHash;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    req.flash('success', 'Password reset successful! Please login with your new password.');
    res.redirect('/auth/login');
  } catch (err) {
    req.flash('error', 'Something went wrong.');
    res.redirect('/auth/reset-password');
  }
};

// Profile management
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    res.render('auth/profile', { title: 'Profile', user: req.session.user, userData: user });
  } catch (err) {
    req.flash('error', 'Could not load profile.');
    res.redirect('/dashboard');
  }
};

exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/auth/profile');
    }

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      req.flash('error', 'Current password is incorrect.');
      return res.redirect('/auth/profile');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordHash = passwordHash;
    await user.save();

    req.flash('success', 'Password updated successfully!');
    res.redirect('/auth/profile');
  } catch (err) {
    req.flash('error', 'Something went wrong.');
    res.redirect('/auth/profile');
  }
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
