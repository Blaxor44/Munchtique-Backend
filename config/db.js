const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using connection string
    await mongoose.connect(process.env.MONGO_URI, {
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1); // Exit the process if there's a failure
  }
};

module.exports = connectDB;
