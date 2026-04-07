const Alert = require('../../../models/Alert');
const weatherService = require('../../../services/weatherService');
const { withMiddleware } = require('../../../middleware/serverless');

const handler = async (req, res) => {
  if (req.method === 'POST') {
    const { type, severity, title, description, zipCode, location, expiresAt } = req.body;

    // Manual validation to match express-validator
    if (!['weather', 'flood', 'earthquake', 'emergency'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid alert type' });
    }
    if (!['low', 'medium', 'high', 'critical'].includes(severity)) {
      return res.status(400).json({ success: false, message: 'Invalid severity level' });
    }
    if (!title || title.trim().length < 5 || title.trim().length > 200) {
      return res.status(400).json({ success: false, message: 'Title must be 5-200 characters' });
    }
    if (!description || description.trim().length < 10 || description.trim().length > 2000) {
      return res.status(400).json({ success: false, message: 'Description must be 10-2000 characters' });
    }
    if (!zipCode || !/^\d{5,6}$/.test(zipCode)) {
      return res.status(400).json({ success: false, message: 'Valid ZIP code required' });
    }

    try {
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

      // NOTE: Socket.io emission is disabled in serverless functions 
      // as it's not natively supported in this environment.

      res.status(201).json({
        success: true,
        message: 'Alert created successfully! (Real-time socket notifications are disabled in serverless mode)',
        data: { alert }
      });
    } catch (error) {
      console.error('Create alert error:', error);
      res.status(500).json({ success: false, message: 'Server error creating alert.' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};

module.exports = withMiddleware(handler, { protect: true, adminOnly: true });
