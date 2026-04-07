const jwt = require('jsonwebtoken');
const User = require('../models/User');
const connectDB = require('../config/db');

/**
 * Higher-order function to wrap serverless handlers with common logic
 * Handles:
 * 1. DB connection
 * 2. Auth (if required)
 * 3. Global error handling
 */
const withMiddleware = (handler, options = {}) => {
  return async (req, res) => {
    try {
      // 1. Ensure DB Connection
      await connectDB();

      // 2. Auth Logic
      if (options.protect || options.adminOnly) {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
          token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
          return res.status(401).json({
            success: false,
            message: 'Not authorized. No token provided.'
          });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'User not found.'
          });
        }

        if (options.adminOnly && user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
          });
        }

        req.user = user; // Attach user to request
      }

      // 3. Execution of the original handler
      return await handler(req, res);
    } catch (error) {
      console.error('SERVERLESS_ERROR:', error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Invalid token.' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired.' });
      }

      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

module.exports = { withMiddleware };
