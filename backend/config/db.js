const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    if (err.message.includes('ECONNREFUSED')) {
      console.error(
        '\nMongoDB is not running on this machine.\n' +
          '  Option 1: start the local service (Windows: run "net start MongoDB" as Administrator)\n' +
          '  Option 2: use MongoDB Atlas and put its connection string in MONGO_URI in backend/.env\n'
      );
    }
    process.exit(1);
  }
};

module.exports = connectDB;
