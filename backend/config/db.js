const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {});
    if (conn.connection.readyState === 1) {
      console.log(`MongoDB connected: ${conn.connection.host}`);
      console.log(`DataBase Connected: ${conn.connection.name}`);
    } else {
      throw new Error("Failed to connect to MongoDB");
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB };
