const Alert = require('../../models/Alert');
const { withMiddleware } = require('../../middleware/serverless');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { id } = req.query; // Vercel populates req.query with dynamic path segments
    const alert = await Alert.findById(id);
    
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
    res.status(500).json({ success: false, message: 'Server error fetching alert.' });
  }
};

module.exports = withMiddleware(handler);
