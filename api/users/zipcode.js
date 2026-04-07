const User = require('../../models/User');
const { withMiddleware } = require('../../middleware/serverless');

const handler = async (req, res) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { zipCode } = req.body;

  if (!zipCode || !/^\d{5,6}$/.test(zipCode)) {
    return res.status(400).json({ success: false, message: 'Valid ZIP code required (5-6 digits)' });
  }

  try {
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
    res.status(500).json({ success: false, message: 'Server error updating ZIP code.' });
  }
};

module.exports = withMiddleware(handler, { protect: true });
