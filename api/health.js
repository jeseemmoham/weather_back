module.exports = (req, res) => {
  res.status(200).json({
    success: true,
    message: '🛡️ Disaster Alert System API is running (Serverless Mode)',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
};
