require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Import config & services
const connectDB = require('../config/db');

// Import serverless API handlers
const registerHandler = require('./auth/register');
const loginHandler = require('./auth/login');
const meHandler = require('./auth/me');
const healthHandler = require('./health');

// Initialize Express app
const app = express();

// ─── CORS CONFIGURATION ──────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  ...(process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map(o => o.trim())
    : [])
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    if (origin.includes('ngrok') || origin.includes('ngrok.io')) {
      return callback(null, true);
    }
    return callback(null, true); // Allow in serverless
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400
};

// Apply middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ─── Routes ────────────────────────────────────────────────

// Health check
app.get('/health', healthHandler);

// Auth routes - handlers already wrap with middleware
app.post('/auth/register', registerHandler);
app.post('/auth/login', loginHandler);
app.get('/auth/me', meHandler);

// Stub routes for now (return 501 Not Implemented)
app.all('*', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Endpoint not yet implemented on serverless',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Export for Vercel
module.exports = app;
