const mongoose = require('mongoose');
require('dotenv/config');

const url = process.env.MONGODB_URL;

async function connect() {
  try {
      await mongoose.connect(url, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
      });
      console.log('Connected successfully to MongoDB');
  } catch (err) {
      console.error('Failed to connect to MongoDB', err);
      throw err;
  }
}

async function close() {
  try {
      await mongoose.disconnect();
      console.log('MongoDB connection closed');
  } catch (err) {
      console.error('Error closing MongoDB connection', err);
  }
}

module.exports = { connect, close };