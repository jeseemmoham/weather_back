require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

// Import config & services
const connectDB = require('./config/db');
const { initSocket, startDemoMode } = require('./services/socketService');
const { seedAlerts } = require('./services/alertEngine');
const emailService = require('./services/emailService');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const alertRoutes = require('./routes/alerts');
const adminRoutes = require('./routes/admin');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// ─── CORS FIX (FINAL VERSION) ──────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  ...(process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map(o => o.trim())
    : [])
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, mobile apps, etc.)
    if (!origin) return callback(null, true);

    // Allow localhost + env URLs
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // ✅ Allow ALL Vercel deployments (fixes your issue)
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Socket.io CORS
const io = new Server(server, {
  cors: corsOptions
});

// Make io accessible in routes
app.set('io', io);

// Apply CORS middleware
app.use(cors(corsOptions));

// ✅ IMPORTANT: Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ─── Routes ────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🛡️ Disaster Alert System API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);

  // CORS error handling
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS blocked this request'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// ─── Start Server ──────────────────────────────────────────
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect DB
    await connectDB();

    // Socket init
    initSocket(io);

    // Email service
    emailService.init();

    // Seed alerts
    await seedAlerts();

    // Demo mode
    if (process.env.DEMO_MODE === 'true') {
      startDemoMode(90000);
    }

    server.listen(PORT, () => {
      console.log('');
      console.log('╔══════════════════════════════════════════════════╗');
      console.log('║     🛡️  DISASTER ALERT SYSTEM - SERVER          ║');
      console.log('╠══════════════════════════════════════════════════╣');
      console.log(`║  🌐 Server:    http://localhost:${PORT}             ║`);
      console.log(`║  📡 Socket.io: ws://localhost:${PORT}               ║`);
      console.log(`║  🏥 Health:    http://localhost:${PORT}/api/health   ║`);
      console.log(`║  🎭 Demo Mode: ${process.env.DEMO_MODE === 'true' ? 'ENABLED ' : 'DISABLED'}                       ║`);
      console.log('╚══════════════════════════════════════════════════╝');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();