const express = require('express');
const Alert = require('../models/Alert');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/alerts
// @desc    Get alerts for user's ZIP code
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { zipCode } = req.user;
    const { type, severity, limit = 20, page = 1 } = req.query;

    const query = { zipCode, active: true };
    if (type) query.type = type;
    if (severity) query.severity = severity;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Alert.countDocuments(query);

    res.json({
      success: true,
      data: {
        alerts,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Fetch alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching alerts.'
    });
  }
});

// @route   GET /api/alerts/all
// @desc    Get all active alerts (public)
// @access  Public
router.get('/all', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const alerts = await Alert.find({ active: true })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { alerts }
    });
  } catch (error) {
    console.error('Fetch all alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching alerts.'
    });
  }
});

// @route   GET /api/alerts/:id
// @desc    Get single alert by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found.'
      });
    }

    res.json({
      success: true,
      data: { alert }
    });
  } catch (error) {
    console.error('Fetch alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching alert.'
    });
  }
});

module.exports = router;
