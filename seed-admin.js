// Admin user seed script
// Run this once to create the default admin account
// Usage: node seed-admin.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

async function seedAdmin() {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@disaster.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log(`   Email: admin@disaster.com`);
      console.log(`   Role: ${existingAdmin.role}`);
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@disaster.com',
      password: 'admin123',
      zipCode: '10001',
      role: 'admin',
      emailNotifications: true,
      alertPreferences: {
        weather: true,
        flood: true,
        earthquake: true,
        emergency: true,
      }
    });

    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║     ✅ ADMIN USER CREATED SUCCESSFULLY      ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log('║  📧 Email:    admin@disaster.com             ║');
    console.log('║  🔑 Password: admin123                      ║');
    console.log('║  🏷️  Role:     admin                         ║');
    console.log('║  📍 ZIP:      10001                         ║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
}

seedAdmin();
