const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();

async function setup() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/event-mgmt');
    console.log('Connected to MongoDB');

    // Check if admin user exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists:', adminExists.email);
      return;
    }

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 12);
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@eventify.com',
      passwordHash,
      role: 'admin'
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@eventify.com');
    console.log('Password: admin123');
    console.log('Please change this password after first login!');

  } catch (error) {
    console.error('Setup failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

setup();
