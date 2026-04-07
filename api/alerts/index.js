const Alert = require('../../models/Alert');
const { withMiddleware } = require('../../middleware/serverless');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

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
    res.status(500).json({ success: false, message: 'Server error fetching alerts.' });
  }
};

module.exports = withMiddleware(handler, { protect: true });
