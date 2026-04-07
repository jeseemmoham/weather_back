const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   PUT /api/users/zipcode
// @desc    Update user's ZIP code
// @access  Private
router.put('/zipcode', protect, [
  body('zipCode').matches(/^\d{5,6}$/).withMessage('Valid ZIP code required (5-6 digits)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    const { zipCode } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { zipCode },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'ZIP code updated successfully!',
      data: { user }
    });
  } catch (error) {
    console.error('ZIP code update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating ZIP code.'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('emailNotifications').optional().isBoolean().withMessage('Email notifications must be boolean'),
  body('alertPreferences').optional().isObject().withMessage('Alert preferences must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.emailNotifications !== undefined) updates.emailNotifications = req.body.emailNotifications;
    if (req.body.alertPreferences) updates.alertPreferences = req.body.alertPreferences;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      data: { user }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile.'
    });
  }
});

module.exports = router;
