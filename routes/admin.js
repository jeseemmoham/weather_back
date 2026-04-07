const express = require('express');
const { body, validationResult } = require('express-validator');
const Alert = require('../models/Alert');
const User = require('../models/User');
const weatherService = require('../services/weatherService');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// @route   POST /api/admin/alerts
// @desc    Create and push a new alert
// @access  Admin
router.post('/alerts', [
  body('type').isIn(['weather', 'flood', 'earthquake', 'emergency']).withMessage('Invalid alert type'),
  body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity level'),
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
  body('zipCode').matches(/^\d{5,6}$/).withMessage('Valid ZIP code required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const { type, severity, title, description, zipCode, location, expiresAt } = req.body;

    let finalLocation = location;
    if (!finalLocation || !finalLocation.coordinates || (finalLocation.coordinates[0] === 0 && finalLocation.coordinates[1] === 0)) {
      const geo = await weatherService.getGeoLocationByZip(zipCode);
      if (geo) {
        finalLocation = { type: 'Point', coordinates: [geo.lon, geo.lat], city: geo.city };
      } else {
        finalLocation = { type: 'Point', coordinates: [0, 0] };
      }
    }

    const alert = await Alert.create({
      type,
      severity,
      title,
      description,
      zipCode,
      location: finalLocation,
      source: 'admin',
      createdBy: req.user._id,
      expiresAt: expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    // Emit real-time notification via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`zip-${zipCode}`).emit('new-alert', {
        alert,
        message: `🚨 New ${severity.toUpperCase()} ${type} alert for ZIP ${zipCode}`
      });

      // Also emit to the global alerts room
      io.emit('alert-created', { alert });
    }

    res.status(201).json({
      success: true,
      message: 'Alert created and pushed successfully!',
      data: { alert }
    });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating alert.'
    });
  }
});

// @route   PUT /api/admin/alerts/:id
// @desc    Update an alert
// @access  Admin
router.put('/alerts/:id', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found.'
      });
    }

    // Emit update via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`zip-${alert.zipCode}`).emit('alert-updated', { alert });
    }

    res.json({
      success: true,
      message: 'Alert updated successfully!',
      data: { alert }
    });
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating alert.'
    });
  }
});

// @route   DELETE /api/admin/alerts/:id
// @desc    Delete an alert
// @access  Admin
router.delete('/alerts/:id', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found.'
      });
    }

    // Emit deletion via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`zip-${alert.zipCode}`).emit('alert-deleted', { alertId: alert._id });
    }

    res.json({
      success: true,
      message: 'Alert deleted successfully!'
    });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting alert.'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      data: { users, total: users.length }
    });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users.'
    });
  }
});

module.exports = router;
