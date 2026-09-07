const mongoose = require('mongoose');

// Track connection state for health checks
let isConnected = false;

const connectDB = async (retryCount = 0) => {
  const MAX_RETRIES = 5;
  const RETRY_DELAY_MS = 5000;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10s to find a server
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.error(`❌ MongoDB connection error (attempt ${retryCount + 1}): ${error.message}`);

    if (retryCount < MAX_RETRIES) {
      console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      // FIX: attach .catch() to avoid unhandled floating promise rejection
      setTimeout(() => connectDB(retryCount + 1).catch(() => {}), RETRY_DELAY_MS);
    } else {
      console.error('🚫 Max retries reached. Server will continue without DB — check Atlas IP whitelist.');
      // Do NOT call process.exit — keep the Express server alive so the
      // frontend gets a proper JSON error instead of "Backend Offline".
    }
  }
};

// Mongoose connection event listeners for visibility
mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️  MongoDB disconnected.');
});
mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('✅ MongoDB reconnected.');
});

module.exports = connectDB;
module.exports.isConnected = () => isConnected;
