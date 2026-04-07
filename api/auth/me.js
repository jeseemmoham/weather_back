const User = require('../../models/User');
const { withMiddleware } = require('../../middleware/serverless');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // User is already attached to req by withMiddleware(protect: true)
    res.json({
      success: true,
      data: { user: req.user }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching profile.' });
  }
};

module.exports = withMiddleware(handler, { protect: true });
