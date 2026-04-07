const User = require('../../models/User');
const { withMiddleware } = require('../../middleware/serverless');

const handler = async (req, res) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { name, emailNotifications, alertPreferences } = req.body;

  try {
    const updates = {};
    if (name) updates.name = name;
    if (emailNotifications !== undefined) updates.emailNotifications = emailNotifications;
    if (alertPreferences) updates.alertPreferences = alertPreferences;

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
    res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
};

module.exports = withMiddleware(handler, { protect: true });
