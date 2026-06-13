const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {});
    if (conn.connection.readyState === 1) {
      console.log(`MongoDB connected: ${conn.connection.host}`);
    } else {
      throw new Error("Failed to connect to MongoDB");
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = { connectDB };
