const Alert = require('../../models/Alert');
const { withMiddleware } = require('../../middleware/serverless');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

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
    res.status(500).json({ success: false, message: 'Server error fetching alerts.' });
  }
};

module.exports = withMiddleware(handler);
