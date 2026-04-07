const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const connectDB = require('../../config/db');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const handler = async (req, res) => {
  try {
    // Connect to DB
    await connectDB();

    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { name, email, password, zipCode } = req.body;

    // Simple validation to match express-validator logic
    if (!name || name.trim().length < 2 || name.trim().length > 50) {
      return res.status(400).json({ success: false, message: 'Name must be 2-50 characters' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    if (!zipCode || !/^\d{5,6}$/.test(zipCode)) {
      return res.status(400).json({ success: false, message: 'Valid ZIP code required (5-6 digits)' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const user = await User.create({ name, email, password, zipCode });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          zipCode: user.zipCode,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

module.exports = handler;
