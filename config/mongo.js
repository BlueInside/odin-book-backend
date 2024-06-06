const mongoose = require('mongoose');
const debug = require('debug')('odin-book-backend:mongoDB');
require('dotenv').config();

async function main() {
  try {
    if (!process.env.MONGODB_URL) {
      throw new Error('MONGODB_URL environment variable not provided!');
    }
    await mongoose.connect(process.env.MONGODB_URL);
    debug('Successfully connected to the database');
  } catch (err) {
    debug('Database connection error:', err.message);
    process.exit(1);
  }
}

main();
