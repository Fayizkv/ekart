const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const dbURI = process.env.MONGODB_URI;

const connectDB = async () => {
  // Check if already connected
  if (mongoose.connection.readyState === 1) {
    console.log('Already connected to MongoDB');
    return;
  }

  try {
    await mongoose.connect(dbURI,);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.log('Failed to connect to MongoDB', err);
  }
};

module.exports = connectDB;
