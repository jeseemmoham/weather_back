const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 (fixes DNS issues on Windows)
    });

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });

  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    console.error('💡 Make sure your MONGODB_URI in .env is correct.');
    console.error('💡 Get a free cluster at https://www.mongodb.com/atlas');
    process.exit(1);
  }
};

module.exports = connectDB;
