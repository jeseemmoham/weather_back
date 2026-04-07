const User = require('../../models/User');
const { withMiddleware } = require('../../middleware/serverless');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      data: { users, total: users.length }
    });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching users.' });
  }
};

module.exports = withMiddleware(handler, { protect: true, adminOnly: true });
