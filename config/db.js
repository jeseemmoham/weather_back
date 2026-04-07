const mongoose = require('mongoose');

// Use a variable to cache the connection
let cachedServerlessConn = null;

const connectDB = async () => {
  if (cachedServerlessConn) {
    return cachedServerlessConn;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 (fixes DNS issues on Windows)
    });

    cachedServerlessConn = conn;
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
      cachedServerlessConn = null;
    });

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    throw error; // Let the handler manage the error
  }
};

module.exports = connectDB;
