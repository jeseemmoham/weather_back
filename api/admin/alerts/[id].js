const Alert = require('../../../models/Alert');
const { withMiddleware } = require('../../../middleware/serverless');

const handler = async (req, res) => {
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const alert = await Alert.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!alert) {
        return res.status(404).json({ success: false, message: 'Alert not found.' });
      }

      res.json({
        success: true,
        message: 'Alert updated successfully!',
        data: { alert }
      });
    } catch (error) {
      console.error('Update alert error:', error);
      res.status(500).json({ success: false, message: 'Server error updating alert.' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const alert = await Alert.findByIdAndDelete(id);

      if (!alert) {
        return res.status(404).json({ success: false, message: 'Alert not found.' });
      }

      res.json({
        success: true,
        message: 'Alert deleted successfully!'
      });
    } catch (error) {
      console.error('Delete alert error:', error);
      res.status(500).json({ success: false, message: 'Server error deleting alert.' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};

module.exports = withMiddleware(handler, { protect: true, adminOnly: true });
